import { beforeEach, describe, expect, it } from 'vitest';
import { user } from '../../db/schema';
import { createTestDb } from '../../db/testing';
import { createUsageRepository } from './repository';
import { createUsageService } from './service';

const limits = {
	hourCredits: 1000,
	weekCredits: 3000,
	gracePercent: 10,
	totalCredits: 10_000,
};

let db: Awaited<ReturnType<typeof createTestDb>>;
let now: Date;

beforeEach(async () => {
	db = await createTestDb();
	await db.insert(user).values([
		{ id: 'ada', name: 'Ada', email: 'ada@test.dev' },
		{ id: 'grace', name: 'Grace', email: 'grace@test.dev' },
	]);
	now = new Date('2026-11-15T10:00:00Z');
});

const later = (minutes: number) => {
	now = new Date(now.getTime() + minutes * 60_000);
};

const createService = (overrides: Partial<typeof limits> = {}) =>
	createUsageService({
		repo: createUsageRepository(db),
		limits: { ...limits, ...overrides },
		// DeepSeek Pro counts 4 credits a token, everything else 1
		weightOf: (modelId) => (modelId === 'deepseek-pro' ? 4 : 1),
		now: () => now,
	});

describe('the usage service', () => {
	it('counts tokens times the model weight, per student', async () => {
		const usage = createService();

		await usage.spend('ada', 'deepseek-flash', 100);
		await usage.spend('ada', 'deepseek-pro', 100);
		const ada = await usage.getUsage('ada');

		// 100 + 400 credits of 1000
		expect(ada.hour).toEqual({
			percent: 50,
			state: 'ok',
			resetsAt: '2026-11-15T11:00:00.000Z',
		});
		expect(ada.week.resetsAt).toBe('2026-11-22T10:00:00.000Z');
		expect((await usage.getUsage('grace')).hour).toEqual({
			percent: 0,
			state: 'ok',
			resetsAt: null,
		});
	});

	it('lets a student finish inside the extra allowance, then blocks until the hour resets', async () => {
		const usage = createService();

		await usage.spend('ada', 'deepseek-flash', 1050);
		await expect(usage.requireRoom('ada')).resolves.toBeUndefined();
		expect((await usage.getUsage('ada')).state).toBe('grace');

		await usage.spend('ada', 'deepseek-flash', 50);
		later(20);
		await expect(usage.requireRoom('ada')).rejects.toThrow(
			"You have used this hour's AI limit. It resets in 40 minutes."
		);
		// another student is not affected
		await expect(usage.requireRoom('grace')).resolves.toBeUndefined();

		later(40);
		await expect(usage.requireRoom('ada')).resolves.toBeUndefined();
		// the next use starts a new hour with only its own credits
		await usage.spend('ada', 'deepseek-flash', 10);
		expect((await usage.getUsage('ada')).hour).toEqual({
			percent: 1,
			state: 'ok',
			resetsAt: '2026-11-15T12:00:00.000Z',
		});
	});

	it('blocks for the week once the weekly limit is used, hour or not', async () => {
		const usage = createService();

		// three full hours, each just inside the hourly allowance
		for (let i = 0; i < 3; i += 1) {
			await usage.spend('ada', 'deepseek-flash', 1099);
			later(61);
		}
		await usage.spend('ada', 'deepseek-flash', 200);
		const { week, state } = await usage.getUsage('ada');

		expect(week.percent).toBe(116);
		expect(state).toBe('blocked');
		await expect(usage.requireRoom('ada')).rejects.toThrow(
			"You have used this week's AI limit. It resets in 7 days."
		);
	});

	it('stops every student once the beta budget is used up', async () => {
		const usage = createService({ totalCredits: 1500 });

		await usage.spend('ada', 'deepseek-flash', 800);
		await usage.spend('grace', 'deepseek-flash', 700);

		expect((await usage.getUsage('grace')).budgetUsedUp).toBe(true);
		await expect(usage.requireRoom('grace')).rejects.toMatchObject({
			status: 429,
			code: 'usage_limit',
		});
		await expect(usage.requireRoom('ada')).rejects.toThrow(/beta is used up/);
	});

	it('counts two calls that end at the same moment', async () => {
		const usage = createService();

		await Promise.all([
			usage.spend('ada', 'deepseek-flash', 300),
			usage.spend('ada', 'deepseek-flash', 300),
		]);

		expect((await usage.getUsage('ada')).hour.percent).toBe(60);
	});

	it('keeps the usage in the database, so a new service sees it', async () => {
		await createService().spend('ada', 'deepseek-flash', 950);

		expect((await createService().getUsage('ada')).hour.state).toBe('almost');
	});
});

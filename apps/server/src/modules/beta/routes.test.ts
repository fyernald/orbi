import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { betaAccess, betaKey, user } from '../../db/schema';
import { createTestDb } from '../../db/testing';
import { createMemoryMailer } from '../../mail/testing';
import { createTestApp, signUpTestUser } from '../../testing';
import { createBetaKey, hashBetaKey, normalizeBetaKey } from './keys';
import { createBetaRepository } from './repository';

type TestDb = Awaited<ReturnType<typeof createTestDb>>;
let db: TestDb;
let app: Awaited<ReturnType<typeof createTestApp>>;

const DAY_MS = 24 * 60 * 60 * 1000;

beforeAll(async () => {
	db = await createTestDb();
	app = await createTestApp(createMemoryMailer(), {
		requireEmailVerification: false,
		db,
		beta: { keysRequired: true, adminEmails: ['Dev@Orbi.study'] },
		limits: {
			default: 1_000_000,
			pdfUpload: 1_000_000,
			keyPoints: 1_000_000,
			followUps: 1_000_000,
			sessionAnswer: 1_000_000,
			explainAnswer: 1_000_000,
			betaKey: 5,
		},
	});
});

afterAll(async () => {
	await app.close();
});

async function makeKeys(count: number) {
	const keys = Array.from({ length: count }, createBetaKey);
	await createBetaRepository(db).addKeys(
		keys.map((key) => hashBetaKey(normalizeBetaKey(key)!))
	);
	return keys;
}

const get = (url: string, cookie: string) =>
	app.inject({ method: 'GET', url, headers: { cookie } });

const redeem = (cookie: string, key: string) =>
	app.inject({
		method: 'POST',
		url: '/api/beta/redeem',
		headers: { cookie },
		payload: { key },
	});

describe('the beta key gate', () => {
	it('closes the app to a student without a key, but not the beta routes', async () => {
		const cookie = await signUpTestUser(app, 'ada@test.dev');

		const courses = await get('/api/courses', cookie);
		const profile = await get('/api/profile', cookie);
		const access = await get('/api/beta/access', cookie);

		expect(courses.statusCode).toBe(403);
		expect(courses.json().error.code).toBe('beta_access_required');
		expect(profile.statusCode).toBe(403);
		expect(access.statusCode).toBe(200);
		expect(access.json()).toEqual({ hasAccess: false, endsAt: null });
	});

	it('opens the app for 30 days with a good key, typed any way', async () => {
		const cookie = await signUpTestUser(app, 'grace@test.dev');
		const [key] = await makeKeys(1);
		const before = Date.now();

		const response = await redeem(
			cookie,
			key!.toLowerCase().replace(/-/g, ' ')
		);

		expect(response.statusCode).toBe(200);
		const { hasAccess, endsAt } = response.json();
		expect(hasAccess).toBe(true);
		const days = (new Date(endsAt).getTime() - before) / DAY_MS;
		expect(days).toBeGreaterThan(29.9);
		expect(days).toBeLessThan(30.1);
		expect((await get('/api/courses', cookie)).statusCode).toBe(200);
	});

	it('gives every wrong, unknown or used key the same answer', async () => {
		const first = await signUpTestUser(app, 'katherine@test.dev');
		const second = await signUpTestUser(app, 'dorothy@test.dev');
		const [key] = await makeKeys(1);
		await redeem(first, key!);

		const used = await redeem(second, key!);
		const unknown = await redeem(second, createBetaKey());
		const wrong = await redeem(second, 'hello');

		for (const response of [used, unknown, wrong]) {
			expect(response.statusCode).toBe(400);
			expect(response.json().error.message).toBe('This key is not valid.');
		}
		expect((await get('/api/courses', second)).statusCode).toBe(403);
	});

	it('lets only one of two students use a key sent at the same moment', async () => {
		const first = await signUpTestUser(app, 'mary@test.dev');
		const second = await signUpTestUser(app, 'annie@test.dev');
		const [key] = await makeKeys(1);

		const answers = await Promise.all([
			redeem(first, key!),
			redeem(second, key!),
		]);

		expect(answers.map((answer) => answer.statusCode).sort()).toEqual([
			200, 400,
		]);
	});

	it('closes the app when access ends, and a new key opens it again', async () => {
		const cookie = await signUpTestUser(app, 'hedy@test.dev');
		const [first, second] = await makeKeys(2);
		await redeem(cookie, first!);
		const [student] = await db
			.select({ id: user.id })
			.from(user)
			.where(eq(user.email, 'hedy@test.dev'));
		await db
			.update(betaAccess)
			.set({ endsAt: new Date(Date.now() - 1000) })
			.where(eq(betaAccess.userId, student!.id));

		const ended = await get('/api/beta/access', cookie);
		const courses = await get('/api/courses', cookie);
		const renewed = await redeem(cookie, second!);

		expect(ended.json().hasAccess).toBe(false);
		expect(ended.json().endsAt).not.toBeNull();
		expect(courses.statusCode).toBe(403);
		expect(renewed.json().hasAccess).toBe(true);
		expect((await get('/api/courses', cookie)).statusCode).toBe(200);
	});

	it('lets admins in without a key', async () => {
		const cookie = await signUpTestUser(app, 'dev@orbi.study');

		expect((await get('/api/courses', cookie)).statusCode).toBe(200);
		expect((await get('/api/beta/access', cookie)).json()).toEqual({
			hasAccess: true,
			endsAt: null,
		});
	});

	it('keeps a used key marked when its student deletes their account', async () => {
		const cookie = await signUpTestUser(app, 'ida@test.dev');
		const [key] = await makeKeys(1);
		await redeem(cookie, key!);
		const hash = hashBetaKey(normalizeBetaKey(key!)!);

		await db.delete(user).where(eq(user.email, 'ida@test.dev'));
		const [row] = await db
			.select()
			.from(betaKey)
			.where(eq(betaKey.keyHash, hash));
		const again = await redeem(
			await signUpTestUser(app, 'joan@test.dev'),
			key!
		);

		expect(row?.usedBy).toBeNull();
		expect(row?.usedAt).not.toBeNull();
		expect(again.statusCode).toBe(400);
	});

	it('allows only a few tries', async () => {
		const cookie = await signUpTestUser(app, 'radia@test.dev');

		const answers = [];
		for (let i = 0; i < 6; i += 1) {
			answers.push((await redeem(cookie, createBetaKey())).statusCode);
		}

		expect(answers).toEqual([400, 400, 400, 400, 400, 429]);
	});

	it('needs a login', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/api/beta/redeem',
			payload: { key: 'ORBI-7KQ2-M9XD-R4TW' },
		});

		expect(response.statusCode).toBe(401);
	});
});

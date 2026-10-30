import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryMailer } from '../../mail/testing';
import { createTestApp, signUpTestUser } from '../../testing';

let app: Awaited<ReturnType<typeof createTestApp>>;

beforeAll(async () => {
	app = await createTestApp(createMemoryMailer(), {
		requireEmailVerification: false,
	});
});

afterAll(async () => {
	await app.close();
});

const send = (
	cookie: string,
	method: 'GET' | 'PATCH' | 'POST',
	url: string,
	payload?: object
) => app.inject({ method, url, headers: { cookie }, payload });

// the day `years` years ago, moved on by `days` days
const yearsAgo = (years: number, days = 0) => {
	const date = new Date();
	date.setUTCFullYear(date.getUTCFullYear() - years);
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
};

const allAnswers = {
	preferredName: ' Ada ',
	birthDate: '2004-12-10',
	uses: ['exam_prep', 'research'],
	educationLevel: 'undergraduate',
	fieldOfStudy: ' Computer Engineering ',
	interests: ['Football', 'Space'],
	explanationStyle: 'step_by_step',
	dailyMinutes: 30,
	studyTime: 'evening',
	locale: 'tr',
	timezone: 'Europe/Istanbul',
};

describe('profile', () => {
	it('gives a new user a profile with every question open', async () => {
		const ada = await signUpTestUser(app, 'ada@test.dev');

		const response = await send(ada, 'GET', '/api/profile');

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			preferredName: null,
			birthDate: null,
			uses: [],
			educationLevel: null,
			fieldOfStudy: null,
			interests: [],
			explanationStyle: null,
			dailyMinutes: null,
			studyTime: null,
			locale: null,
			timezone: null,
			onboardedAt: null,
		});
	});

	it('saves the answers one question at a time', async () => {
		const grace = await signUpTestUser(app, 'grace@test.dev');

		await send(grace, 'PATCH', '/api/profile', { uses: ['research'] });
		const response = await send(grace, 'PATCH', '/api/profile', {
			educationLevel: 'postgraduate',
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({
			uses: ['research'],
			educationLevel: 'postgraduate',
			onboardedAt: null,
		});
	});

	it.each([
		['no use', { uses: [] }],
		[
			'more than three uses',
			{ uses: ['exam_prep', 'keep_up', 'research', 'learn_new'] },
		],
		['the same use twice', { uses: ['research', 'research'] }],
		['an unknown level', { educationLevel: 'kindergarten' }],
		['an empty field of study', { fieldOfStudy: '   ' }],
		['the same interest twice', { interests: ['Space', 'space'] }],
		['an unknown daily time', { dailyMinutes: 45 }],
		['an unknown language', { locale: 'xx' }],
		['an unknown time zone', { timezone: 'Mars/Olympus' }],
		['an empty name', { preferredName: '  ' }],
		['a day that does not exist', { birthDate: '2004-02-30' }],
		['a birth date in the future', { birthDate: '2999-01-01' }],
		['a birth date before 1900', { birthDate: '1899-12-31' }],
		['someone younger than 13', { birthDate: yearsAgo(13, 1) }],
	])('refuses %s', async (_, payload) => {
		const alan = await signUpTestUser(app, `alan-${Math.random()}@test.dev`);

		const response = await send(alan, 'PATCH', '/api/profile', payload);

		expect(response.statusCode).toBe(400);
	});

	it('accepts someone who turns 13 today', async () => {
		const ada = await signUpTestUser(app, 'turns-13@test.dev');

		const response = await send(ada, 'PATCH', '/api/profile', {
			birthDate: yearsAgo(13),
		});

		expect(response.statusCode).toBe(200);
	});

	it('keeps onboarding open until every question is answered', async () => {
		const linus = await signUpTestUser(app, 'linus@test.dev');
		const { timezone: _, ...almostAll } = allAnswers;
		await send(linus, 'PATCH', '/api/profile', almostAll);

		const response = await send(linus, 'POST', '/api/profile/onboarding');

		expect(response.statusCode).toBe(400);
		expect(response.json().error.code).toBe('validation_error');
	});

	it('finishes onboarding once and keeps the first time', async () => {
		const barbara = await signUpTestUser(app, 'barbara@test.dev');
		await send(barbara, 'PATCH', '/api/profile', allAnswers);

		const first = await send(barbara, 'POST', '/api/profile/onboarding');
		const second = await send(barbara, 'POST', '/api/profile/onboarding');

		expect(first.statusCode).toBe(200);
		expect(first.json()).toMatchObject({
			preferredName: 'Ada',
			birthDate: '2004-12-10',
			fieldOfStudy: 'Computer Engineering',
			onboardedAt: expect.any(String),
		});
		expect(second.json().onboardedAt).toBe(first.json().onboardedAt);
	});

	it('never shows one user the profile of another', async () => {
		const ken = await signUpTestUser(app, 'ken@test.dev');
		const dennis = await signUpTestUser(app, 'dennis@test.dev');
		await send(ken, 'PATCH', '/api/profile', allAnswers);

		const response = await send(dennis, 'GET', '/api/profile');

		expect(response.json().uses).toEqual([]);
	});

	it('needs a login', async () => {
		const response = await app.inject({ method: 'GET', url: '/api/profile' });

		expect(response.statusCode).toBe(401);
	});
});

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

describe('GET /api/usage', () => {
	it("gives a new student's usage: nothing used, no window started", async () => {
		const cookie = await signUpTestUser(app, 'ada@test.dev');

		const response = await app.inject({
			method: 'GET',
			url: '/api/usage',
			headers: { cookie },
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			hour: { percent: 0, state: 'ok', resetsAt: null },
			week: { percent: 0, state: 'ok', resetsAt: null },
			state: 'ok',
			budgetUsedUp: false,
		});
	});

	it('needs a login', async () => {
		const response = await app.inject({ method: 'GET', url: '/api/usage' });

		expect(response.statusCode).toBe(401);
	});
});

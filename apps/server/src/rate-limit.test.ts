import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryMailer } from './mail/testing';
import { createTestApp, signUpTestUser } from './testing';

let app: Awaited<ReturnType<typeof createTestApp>>;
let ada: string;
let grace: string;

beforeAll(async () => {
	app = await createTestApp(createMemoryMailer(), {
		requireEmailVerification: false,
		limits: {
			default: 3,
			pdfUpload: 1,
			keyPoints: 1,
			voiceNote: 1,
			followUps: 1,
			sessionAnswer: 1,
			explainAnswer: 1,
			betaKey: 1,
		},
	});
	ada = await signUpTestUser(app, 'ada@test.dev');
	grace = await signUpTestUser(app, 'grace@test.dev');
});

afterAll(async () => {
	await app.close();
});

const get = (url: string, cookie?: string) =>
	app.inject({ method: 'GET', url, headers: cookie ? { cookie } : {} });

describe('rate limit', () => {
	it('refuses a session over the limit, in the usual error shape', async () => {
		for (let count = 0; count < 3; count += 1) {
			expect((await get('/api/courses', ada)).statusCode).toBe(200);
		}

		const refused = await get('/api/courses', ada);

		expect(refused.statusCode).toBe(429);
		expect(refused.json()).toEqual({
			error: {
				code: 'too_many_requests',
				message: expect.stringMatching(
					/^Too many requests\. Wait .+ and try again\.$/
				),
			},
		});
		expect(Number(refused.headers['retry-after'])).toBeGreaterThan(0);
	});

	it('counts each session on its own, though they share an address', async () => {
		expect((await get('/api/courses', grace)).statusCode).toBe(200);
	});

	it('counts requests without a login by their address', async () => {
		for (let count = 0; count < 3; count += 1) {
			expect((await get('/api/courses')).statusCode).toBe(401);
		}

		expect((await get('/api/courses')).statusCode).toBe(429);
	});

	it('gives a route its own lower limit', async () => {
		const answer = () =>
			app.inject({
				method: 'POST',
				url: `/api/questions/${randomUUID()}/session-answer`,
				headers: { cookie: grace },
				payload: { choice: 0 },
			});

		expect((await answer()).statusCode).toBe(404);
		expect((await answer()).statusCode).toBe(429);
	});

	it('leaves the health check and Better Auth to themselves', async () => {
		for (let count = 0; count < 5; count += 1) {
			expect((await get('/api/health')).statusCode).toBe(200);
			expect((await get('/api/auth/get-session', ada)).statusCode).toBe(200);
		}
	});
});

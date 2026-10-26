import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryMailer } from '../../mail/testing';
import { createTestApp, TEST_ORIGIN } from '../../testing';

const mailer = createMemoryMailer();
let app: Awaited<ReturnType<typeof createTestApp>>;

beforeAll(async () => {
	app = await createTestApp(mailer, { requireEmailVerification: false });
});

afterAll(async () => {
	await app.close();
});

function signUp(email: string) {
	return app.inject({
		method: 'POST',
		url: '/api/auth/sign-up/email',
		headers: { origin: TEST_ORIGIN },
		payload: { name: 'Ada', email, password: 'correct-horse-battery' },
	});
}

describe('sign up on a local run', () => {
	it('logs in right away and sends no email', async () => {
		const response = await signUp('local@test.dev');

		expect(response.statusCode).toBe(200);
		expect(response.json().token).toBeTruthy();
		expect(mailer.sent).toHaveLength(0);
	});

	it('says when the email already has an account', async () => {
		await signUp('local-taken@test.dev');
		const response = await signUp('local-taken@test.dev');

		expect(response.statusCode).toBe(422);
		expect(response.json().code).toBe('USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL');
	});
});

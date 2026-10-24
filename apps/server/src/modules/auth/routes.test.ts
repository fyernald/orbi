import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp, TEST_ORIGIN } from '../../testing';

type App = Awaited<ReturnType<typeof createTestApp>>;

let app: App;

beforeAll(async () => {
	app = await createTestApp();
});

afterAll(async () => {
	await app.close();
});

const password = 'correct-horse-battery';

function post(url: string, payload: object, cookie?: string) {
	return app.inject({
		method: 'POST',
		url: `/api/auth${url}`,
		headers: { origin: TEST_ORIGIN, ...(cookie ? { cookie } : {}) },
		payload,
	});
}

function getSession(cookie: string) {
	return app.inject({
		method: 'GET',
		url: '/api/auth/get-session',
		headers: { origin: TEST_ORIGIN, cookie },
	});
}

// turns the Set-Cookie headers of a response into a Cookie header for the next request
function cookieFrom(response: Awaited<ReturnType<typeof post>>) {
	const header = response.headers['set-cookie'] ?? [];
	return (Array.isArray(header) ? header : [header])
		.map((cookie) => cookie.split(';')[0])
		.join('; ');
}

function signUp(email: string) {
	return post('/sign-up/email', { name: 'Ada', email, password });
}

describe('auth routes', () => {
	it('signs up a new user and logs them in', async () => {
		const response = await signUp('new@test.dev');

		expect(response.statusCode).toBe(200);
		expect(cookieFrom(response)).toContain('session_token');
	});

	it('rejects a second account with the same email', async () => {
		await signUp('taken@test.dev');
		const response = await signUp('taken@test.dev');

		expect(response.statusCode).toBe(422);
		expect(response.json().code).toMatch(/^USER_ALREADY_EXISTS/);
	});

	it('rejects invalid sign-up input with the shared schema', async () => {
		const response = await post('/sign-up/email', {
			name: ' ',
			email: 'blank-name@test.dev',
			password,
		});

		expect(response.statusCode).toBe(400);
		expect(response.json().code).toBe('VALIDATION_ERROR');
	});

	it('rejects a wrong password', async () => {
		await signUp('wrong@test.dev');
		const response = await post('/sign-in/email', {
			email: 'wrong@test.dev',
			password: 'not-the-password',
		});

		expect(response.statusCode).toBe(401);
		expect(response.json().code).toBe('INVALID_EMAIL_OR_PASSWORD');
	});

	it('keeps the user logged in with the session cookie', async () => {
		await signUp('stay@test.dev');
		const signIn = await post('/sign-in/email', {
			email: 'stay@test.dev',
			password,
		});

		const session = await getSession(cookieFrom(signIn));

		expect(signIn.statusCode).toBe(200);
		expect(session.json().user.email).toBe('stay@test.dev');
	});

	it('logs out and ends the session', async () => {
		const cookie = cookieFrom(await signUp('leave@test.dev'));

		const signOut = await post('/sign-out', {}, cookie);
		const session = await getSession(cookie);

		expect(signOut.statusCode).toBe(200);
		expect(session.json()).toBeNull();
	});
});

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryMailer } from '../../mail/testing';
import { createTestApp, TEST_ORIGIN } from '../../testing';

type App = Awaited<ReturnType<typeof createTestApp>>;
type Response = Awaited<ReturnType<App['inject']>>;

const mailer = createMemoryMailer();
let app: App;

beforeAll(async () => {
	app = await createTestApp(mailer);
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

// opens a link from an email, like the browser does
function open(link: string) {
	const { pathname, search } = new URL(link);
	return app.inject({ method: 'GET', url: pathname + search });
}

function getSession(cookie: string) {
	return app.inject({
		method: 'GET',
		url: '/api/auth/get-session',
		headers: { origin: TEST_ORIGIN, cookie },
	});
}

// turns the Set-Cookie headers of a response into a Cookie header for the next request
function cookieFrom(response: Response) {
	const header = response.headers['set-cookie'] ?? [];
	return (Array.isArray(header) ? header : [header])
		.map((cookie) => cookie.split(';')[0])
		.join('; ');
}

function emailsTo(email: string) {
	return mailer.sent.filter((sent) => sent.to === email);
}

function lastLinkTo(email: string) {
	const link = emailsTo(email)
		.at(-1)
		?.text.match(/https?:\/\/\S+/)?.[0];
	if (!link) throw new Error(`No link was sent to ${email}`);
	return link;
}

function signUp(email: string) {
	return post('/sign-up/email', {
		name: 'Ada',
		email,
		password,
		callbackURL: '/app',
	});
}

function signIn(email: string, withPassword = password) {
	return post('/sign-in/email', { email, password: withPassword });
}

// signs up and confirms the email, which logs the user in
async function signUpConfirmed(email: string) {
	await signUp(email);
	return cookieFrom(await open(lastLinkTo(email)));
}

describe('sign up', () => {
	it('sends a confirmation email and does not log in yet', async () => {
		const response = await signUp('new@test.dev');

		expect(response.statusCode).toBe(200);
		expect(cookieFrom(response)).not.toContain('session_token');
		expect(emailsTo('new@test.dev')).toHaveLength(1);
	});

	it('answers the same for a taken email and tells the owner by email', async () => {
		await signUpConfirmed('taken@test.dev');
		const response = await signUp('taken@test.dev');

		expect(response.statusCode).toBe(200);
		expect(cookieFrom(response)).not.toContain('session_token');
		expect(emailsTo('taken@test.dev').at(-1)?.subject).toBe(
			'You already have an Orbi account'
		);
	});

	it('rejects invalid input with the shared schema', async () => {
		const response = await post('/sign-up/email', {
			name: ' ',
			email: 'blank-name@test.dev',
			password,
		});

		expect(response.statusCode).toBe(400);
		expect(response.json().code).toBe('VALIDATION_ERROR');
	});

	it('saves the input as the shared schema parsed it', async () => {
		const response = await post('/sign-up/email', {
			name: '  Ada  ',
			email: 'trimmed@test.dev',
			password,
		});

		expect(response.json().user.name).toBe('Ada');
	});

	it('escapes the name in the email', async () => {
		await post('/sign-up/email', {
			name: '<b>Ada</b>',
			email: 'html@test.dev',
			password,
		});

		expect(emailsTo('html@test.dev')[0]?.html).toContain('&lt;b&gt;Ada');
	});
});

describe('email confirmation', () => {
	it('logs the user in and sends them to the app', async () => {
		await signUp('confirm@test.dev');
		const response = await open(lastLinkTo('confirm@test.dev'));
		const session = await getSession(cookieFrom(response));

		expect(response.statusCode).toBe(302);
		expect(response.headers.location).toBe('/app');
		expect(session.json().user.emailVerified).toBe(true);
	});

	it('refuses to log in before the email is confirmed and sends a new link', async () => {
		await signUp('unconfirmed@test.dev');
		const response = await signIn('unconfirmed@test.dev');

		expect(response.statusCode).toBe(403);
		expect(response.json().code).toBe('EMAIL_NOT_VERIFIED');
		expect(emailsTo('unconfirmed@test.dev')).toHaveLength(2);
	});

	it('sends the link again on request', async () => {
		await signUp('resend@test.dev');
		const response = await post('/send-verification-email', {
			email: 'resend@test.dev',
			callbackURL: '/app',
		});

		expect(response.statusCode).toBe(200);
		expect(emailsTo('resend@test.dev')).toHaveLength(2);
	});

	it('sends the user back with an error for a broken link', async () => {
		const response = await open(
			`${TEST_ORIGIN}/api/auth/verify-email?token=broken&callbackURL=%2Fapp`
		);

		expect(response.headers.location).toBe('/app?error=INVALID_TOKEN');
	});
});

describe('log in and out', () => {
	it('keeps the user logged in with the session cookie', async () => {
		await signUpConfirmed('stay@test.dev');
		const response = await signIn('stay@test.dev');
		const session = await getSession(cookieFrom(response));

		expect(response.statusCode).toBe(200);
		expect(session.json().user.email).toBe('stay@test.dev');
	});

	it('rejects a wrong password', async () => {
		await signUpConfirmed('wrong@test.dev');
		const response = await signIn('wrong@test.dev', 'not-the-password');

		expect(response.statusCode).toBe(401);
		expect(response.json().code).toBe('INVALID_EMAIL_OR_PASSWORD');
	});

	it('logs out and ends the session', async () => {
		const cookie = await signUpConfirmed('leave@test.dev');

		const signOut = await post('/sign-out', {}, cookie);
		const session = await getSession(cookie);

		expect(signOut.statusCode).toBe(200);
		expect(session.json()).toBeNull();
	});
});

describe('password reset', () => {
	const newPassword = 'a-brand-new-password';

	function requestReset(email: string) {
		return post('/request-password-reset', {
			email,
			redirectTo: '/reset-password',
		});
	}

	// follows the email link, which sends the browser to the reset page with the token
	async function resetToken(email: string) {
		await requestReset(email);
		const response = await open(lastLinkTo(email));
		const location = new URL(response.headers.location as string, TEST_ORIGIN);
		return location.searchParams.get('token') ?? '';
	}

	it('answers the same for an unknown email and sends nothing', async () => {
		const response = await requestReset('nobody@test.dev');

		expect(response.statusCode).toBe(200);
		expect(emailsTo('nobody@test.dev')).toHaveLength(0);
	});

	it('changes the password and logs out every device', async () => {
		const oldCookie = await signUpConfirmed('reset@test.dev');
		const token = await resetToken('reset@test.dev');

		const reset = await post('/reset-password', { newPassword, token });

		expect(reset.statusCode).toBe(200);
		expect((await getSession(oldCookie)).json()).toBeNull();
		expect((await signIn('reset@test.dev')).statusCode).toBe(401);
		expect((await signIn('reset@test.dev', newPassword)).statusCode).toBe(200);
	});

	it('does not accept the same link twice', async () => {
		await signUpConfirmed('twice@test.dev');
		const token = await resetToken('twice@test.dev');

		await post('/reset-password', { newPassword, token });
		const again = await post('/reset-password', { newPassword, token });

		expect(again.statusCode).toBe(400);
		expect(again.json().code).toBe('INVALID_TOKEN');
	});

	it('rejects a new password that is too short', async () => {
		const response = await post('/reset-password', {
			newPassword: 'short',
			token: 'any',
		});

		expect(response.statusCode).toBe(400);
		expect(response.json().code).toBe('VALIDATION_ERROR');
	});
});

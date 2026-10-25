import {
	emailInput,
	PASSWORD_MAX_LENGTH,
	PASSWORD_MIN_LENGTH,
	resetPasswordInput,
	signInInput,
	signUpInput,
} from '@orbi/shared';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import type { ZodType } from 'zod';
import type { Db } from './db';
import * as schema from './db/schema';
import type { Mailer } from './mail/mailer';
import {
	existingAccountEmail,
	resetPasswordEmail,
	verifyEmail,
} from './modules/auth/emails';

export type AuthOptions = {
	db: Db;
	secret: string;
	baseURL: string;
	mailer: Mailer;
};

// the links in auth emails stop working after one hour
const LINK_LIFETIME_SECONDS = 60 * 60;

// the same shared schemas the client forms use, so the server never trusts the browser
const inputSchemas: Record<string, ZodType> = {
	'/sign-up/email': signUpInput,
	'/sign-in/email': signInInput,
	'/send-verification-email': emailInput,
	'/request-password-reset': emailInput,
	'/reset-password': resetPasswordInput,
};

const validateInput = createAuthMiddleware(async (ctx) => {
	const result = inputSchemas[ctx.path]?.safeParse(ctx.body);
	if (!result) return;
	if (!result.success) {
		throw new APIError('BAD_REQUEST', {
			code: 'VALIDATION_ERROR',
			message: result.error.issues[0]?.message ?? 'Invalid input.',
		});
	}
	// Better Auth gets the parsed values, so for example the name is saved trimmed
	return { context: { body: result.data } };
});

// After changing this config, regenerate the login tables (see docs/database.md).
export function createAuth({ db, secret, baseURL, mailer }: AuthOptions) {
	return betterAuth({
		secret,
		baseURL,
		database: drizzleAdapter(db, { provider: 'pg', schema }),
		emailAndPassword: {
			enabled: true,
			minPasswordLength: PASSWORD_MIN_LENGTH,
			maxPasswordLength: PASSWORD_MAX_LENGTH,
			// no session before the email is confirmed; sign-up also answers the same for a taken email
			requireEmailVerification: true,
			onExistingUserSignUp: ({ user }) =>
				mailer.send(existingAccountEmail(user, baseURL)),
			resetPasswordTokenExpiresIn: LINK_LIFETIME_SECONDS,
			sendResetPassword: ({ user, url }) =>
				mailer.send(resetPasswordEmail(user, url)),
			// a new password logs out every device, in case someone else was logged in
			revokeSessionsOnPasswordReset: true,
		},
		emailVerification: {
			sendOnSignUp: true,
			// logging in before confirming sends a fresh link
			sendOnSignIn: true,
			autoSignInAfterVerification: true,
			expiresIn: LINK_LIFETIME_SECONDS,
			sendVerificationEmail: ({ user, url }) =>
				mailer.send(verifyEmail(user, url)),
		},
		advanced: {
			// send emails after answering, so the answer time never shows if an account exists
			backgroundTasks: { handler: (promise) => void promise },
		},
		hooks: { before: validateInput },
	});
}

export type Auth = ReturnType<typeof createAuth>;

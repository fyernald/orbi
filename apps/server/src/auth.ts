import {
	PASSWORD_MAX_LENGTH,
	PASSWORD_MIN_LENGTH,
	signInInput,
	signUpInput,
} from '@orbi/shared';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import type { ZodType } from 'zod';
import type { Db } from './db';
import * as schema from './db/schema';

export type AuthOptions = {
	db: Db;
	secret: string;
	baseURL: string;
};

// the same shared schemas the client forms use, so the server never trusts the browser
const inputSchemas: Record<string, ZodType> = {
	'/sign-up/email': signUpInput,
	'/sign-in/email': signInInput,
};

const validateInput = createAuthMiddleware(async (ctx) => {
	const result = inputSchemas[ctx.path]?.safeParse(ctx.body);
	if (result && !result.success) {
		throw new APIError('BAD_REQUEST', {
			code: 'VALIDATION_ERROR',
			message: result.error.issues[0]?.message ?? 'Invalid input.',
		});
	}
});

// After changing this config, regenerate the login tables (see docs/database.md).
export function createAuth({ db, secret, baseURL }: AuthOptions) {
	return betterAuth({
		secret,
		baseURL,
		database: drizzleAdapter(db, { provider: 'pg', schema }),
		emailAndPassword: {
			enabled: true,
			minPasswordLength: PASSWORD_MIN_LENGTH,
			maxPasswordLength: PASSWORD_MAX_LENGTH,
		},
		hooks: { before: validateInput },
	});
}

export type Auth = ReturnType<typeof createAuth>;

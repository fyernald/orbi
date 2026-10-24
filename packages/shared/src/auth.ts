import { z } from 'zod';

// The server's Better Auth config uses the same limits.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

const email = z.email('Enter a valid email address.');

export const signInInput = z.object({
	email,
	password: z.string().min(1, 'Enter your password.'),
});

export const signUpInput = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Enter your name.')
		.max(100, 'Use at most 100 characters.'),
	email,
	password: z
		.string()
		.min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
		.max(PASSWORD_MAX_LENGTH, `Use at most ${PASSWORD_MAX_LENGTH} characters.`),
});

export type SignInInput = z.infer<typeof signInInput>;
export type SignUpInput = z.infer<typeof signUpInput>;

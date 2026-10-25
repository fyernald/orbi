import { z } from 'zod';

// The server's Better Auth config uses the same limits.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

const email = z.email('Enter a valid email address.');

const newPassword = z
	.string()
	.min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
	.max(PASSWORD_MAX_LENGTH, `Use at most ${PASSWORD_MAX_LENGTH} characters.`);

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
	password: newPassword,
});

// for the forgot-password form and for sending the confirmation email again
export const emailInput = z.object({ email });

export const resetPasswordInput = z.object({ newPassword });

export type SignInInput = z.infer<typeof signInInput>;
export type SignUpInput = z.infer<typeof signUpInput>;
export type EmailInput = z.infer<typeof emailInput>;
export type ResetPasswordInput = z.infer<typeof resetPasswordInput>;

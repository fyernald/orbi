import { z } from 'zod';

// the key a student types; the server ignores dashes, spaces and small letters
export const redeemBetaKeyInput = z.object({
	key: z
		.string()
		.trim()
		.min(1, 'Enter your beta key.')
		.max(64, 'This key is not valid.'),
});

// GET /api/beta/access: whether the student may use the app during the closed beta
export const betaAccess = z.object({
	hasAccess: z.boolean(),
	// when their access ends; null for a student who never used a key, or an admin
	endsAt: z.iso.datetime().nullable(),
});

export type RedeemBetaKeyInput = z.infer<typeof redeemBetaKeyInput>;
export type BetaAccess = z.infer<typeof betaAccess>;

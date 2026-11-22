import { z } from 'zod';

// The tips the Orbi cat gives (US-48). A closed tip is saved with the account
// and never comes back; the client decides when each one fits.
export const TIP_IDS = [
	'first-course',
	'first-topic',
	'first-notes',
	'ask-about-notes',
] as const;

export const tipId = z.enum(TIP_IDS, 'Unknown tip.');

export const dismissTipInput = z.object({ tipId });

export type TipId = (typeof TIP_IDS)[number];
export type DismissTipInput = z.infer<typeof dismissTipInput>;

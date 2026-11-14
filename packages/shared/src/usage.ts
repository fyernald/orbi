import { z } from 'zod';

// How close a student is to an AI usage limit: under 75%, from 75%, from 90%,
// over 100% but inside the small extra allowance, and blocked until it resets
export const USAGE_STATES = [
	'ok',
	'warning',
	'almost',
	'grace',
	'blocked',
] as const;

export const usageWindow = z.object({
	// how much of the limit is used; over 100 inside the extra allowance
	percent: z.int().min(0),
	state: z.enum(USAGE_STATES),
	// null until the first AI message starts the window
	resetsAt: z.iso.datetime().nullable(),
});

// GET /api/usage: the student's own usage, worked out on the server
export const aiUsage = z.object({
	hour: usageWindow,
	week: usageWindow,
	// the worse of the two windows
	state: z.enum(USAGE_STATES),
	// the whole beta's AI budget is used up, for every student
	budgetUsedUp: z.boolean(),
});

export type UsageState = (typeof USAGE_STATES)[number];
export type UsageWindow = z.infer<typeof usageWindow>;
export type AiUsage = z.infer<typeof aiUsage>;

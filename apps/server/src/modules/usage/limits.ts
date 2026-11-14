import type { UsageState, UsageWindow } from '@orbi/shared';

// how many credits a student may use; every value can be set in .env
export type UsageLimits = {
	hourCredits: number;
	weekCredits: number;
	// a small extra allowance on top of each limit, so a thought can be finished
	gracePercent: number;
	// the whole beta, for every student together
	totalCredits: number;
};

// sized for the closed beta's $20 budget (T-77)
export const USAGE_LIMITS_DEFAULT: UsageLimits = {
	hourCredits: 300_000,
	weekCredits: 1_500_000,
	gracePercent: 10,
	totalCredits: 80_000_000,
};

export const HOUR_MS = 60 * 60 * 1000;
export const WEEK_MS = 7 * 24 * HOUR_MS;

const WARNING_PERCENT = 75;
const ALMOST_PERCENT = 90;

// what is saved for one window: when it started and the credits used since
export type SavedWindow = { startedAt: Date | null; credits: number };

// A window starts with the student's first AI use and lasts its length, then
// the next use starts a new one. An ended window counts as empty.
export function windowUsage(
	saved: SavedWindow,
	{
		limit,
		lengthMs,
		gracePercent,
	}: {
		limit: number;
		lengthMs: number;
		gracePercent: number;
	},
	now: Date
): UsageWindow & { blocked: boolean } {
	const endsAt = saved.startedAt
		? new Date(saved.startedAt.getTime() + lengthMs)
		: null;
	const open = endsAt !== null && endsAt > now;
	const credits = open ? saved.credits : 0;
	const percent = Math.floor((100 * credits) / limit);
	const blocked = credits >= limit * (1 + gracePercent / 100);
	return {
		percent,
		state: blocked ? 'blocked' : stateOf(percent),
		resetsAt: open ? endsAt.toISOString() : null,
		blocked,
	};
}

function stateOf(percent: number): UsageState {
	if (percent >= 100) return 'grace';
	if (percent >= ALMOST_PERCENT) return 'almost';
	if (percent >= WARNING_PERCENT) return 'warning';
	return 'ok';
}

const stateOrder: readonly UsageState[] = [
	'ok',
	'warning',
	'almost',
	'grace',
	'blocked',
];

export const worseState = (a: UsageState, b: UsageState): UsageState =>
	stateOrder.indexOf(a) >= stateOrder.indexOf(b) ? a : b;

// "in 23 minutes", "in 5 hours", "in 3 days"
export function resetsIn(resetsAt: Date, now: Date): string {
	const minutes = Math.max(
		1,
		Math.ceil((resetsAt.getTime() - now.getTime()) / 60_000)
	);
	if (minutes < 60) return plural(minutes, 'minute');
	const hours = Math.ceil(minutes / 60);
	if (hours < 48) return plural(hours, 'hour');
	return plural(Math.ceil(hours / 24), 'day');
}

const plural = (count: number, unit: string) =>
	`in ${count} ${unit}${count === 1 ? '' : 's'}`;

// How many AI tokens a student may use per day, if AI_DAILY_TOKENS_PER_STUDENT does
// not say otherwise: about 40 long replies on a topic with many notes.
export const DAILY_TOKENS_DEFAULT = 1_000_000;

// The AI tokens (input and output) each student used today. Counted in memory, like
// the reply limiter: enough while the API runs as one process, and a restart starts
// everyone's day again. A day is the student's own day, so the budget resets at
// midnight in their time zone.
export interface TokenBudget {
	// whether the student has tokens left today
	hasLeft(userId: string, timeZone: string | null): boolean;
	spend(userId: string, timeZone: string | null, tokens: number): void;
}

// the date in the time zone, like "2026-11-04"; an unknown zone counts as UTC
export function dayIn(timeZone: string | null, at: Date): string {
	const format = (zone: string) =>
		new Intl.DateTimeFormat('en-CA', {
			timeZone: zone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		}).format(at);
	try {
		return format(timeZone ?? 'UTC');
	} catch {
		return format('UTC');
	}
}

export function createTokenBudget({
	dailyTokens,
	now = () => new Date(),
}: {
	dailyTokens: number;
	now?: () => Date;
}): TokenBudget {
	// only today's count is kept for each student; another day starts at 0
	const used = new Map<string, { day: string; tokens: number }>();
	const usedToday = (userId: string, day: string) => {
		const entry = used.get(userId);
		return entry?.day === day ? entry.tokens : 0;
	};

	return {
		hasLeft(userId, timeZone) {
			return usedToday(userId, dayIn(timeZone, now())) < dailyTokens;
		},

		spend(userId, timeZone, tokens) {
			const day = dayIn(timeZone, now());
			used.set(userId, { day, tokens: usedToday(userId, day) + tokens });
		},
	};
}

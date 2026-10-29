export type StreakLevel = 'none' | 'warm' | 'hot' | 'blazing';

// a week and a month are the steps students notice and aim for
export function streakLevel(days: number): StreakLevel {
	if (days >= 30) return 'blazing';
	if (days >= 7) return 'hot';
	if (days >= 1) return 'warm';
	return 'none';
}

export function streakLabel(days: number): string {
	if (days === 0) return 'No streak yet. Study today to start one.';
	const label = `${days}-day streak`;
	return streakLevel(days) === 'warm' ? label : `${label}. Keep it going!`;
}

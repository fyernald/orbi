import { describe, expect, it } from 'vitest';
import { streakLabel, streakLevel } from './streak';

describe('streakLevel', () => {
	it.each([
		[0, 'none'],
		[1, 'warm'],
		[6, 'warm'],
		[7, 'hot'],
		[29, 'hot'],
		[30, 'blazing'],
		[365, 'blazing'],
	])('%i days is %s', (days, level) => {
		expect(streakLevel(days)).toBe(level);
	});
});

describe('streakLabel', () => {
	it('invites a student with no streak to start one', () => {
		expect(streakLabel(0)).toBe('No streak yet. Study today to start one.');
	});

	it('cheers on longer streaks', () => {
		expect(streakLabel(3)).toBe('3-day streak');
		expect(streakLabel(12)).toBe('12-day streak. Keep it going!');
	});
});

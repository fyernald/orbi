import { describe, expect, it } from 'vitest';
import { createTokenBudget, dayIn } from './budget';

describe('dayIn', () => {
	it("gives the date where the student is, not the server's", () => {
		const late = new Date('2026-11-04T22:30:00Z');

		expect(dayIn('Asia/Baghdad', late)).toBe('2026-11-05');
		expect(dayIn('America/New_York', late)).toBe('2026-11-04');
		expect(dayIn(null, late)).toBe('2026-11-04');
	});

	it('counts an unknown time zone as UTC', () => {
		expect(dayIn('Mars/Olympus', new Date('2026-11-04T22:30:00Z'))).toBe(
			'2026-11-04'
		);
	});
});

describe('createTokenBudget', () => {
	it('has tokens left until the day is used up', () => {
		const budget = createTokenBudget({ dailyTokens: 100 });

		budget.spend('ada', null, 60);
		const afterOne = budget.hasLeft('ada', null);
		budget.spend('ada', null, 40);

		expect(afterOne).toBe(true);
		expect(budget.hasLeft('ada', null)).toBe(false);
		// every student has their own budget
		expect(budget.hasLeft('grace', null)).toBe(true);
	});

	it("starts again at midnight in the student's time zone", () => {
		let now = new Date('2026-11-04T20:00:00Z');
		const budget = createTokenBudget({ dailyTokens: 100, now: () => now });
		budget.spend('ada', 'Asia/Baghdad', 100);

		// 23:59 in Baghdad (UTC+3): still the same day
		now = new Date('2026-11-04T20:59:00Z');
		const beforeMidnight = budget.hasLeft('ada', 'Asia/Baghdad');
		// 00:01 in Baghdad, still 4 November on the server
		now = new Date('2026-11-04T21:01:00Z');

		expect(beforeMidnight).toBe(false);
		expect(budget.hasLeft('ada', 'Asia/Baghdad')).toBe(true);
	});
});

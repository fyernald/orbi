import { describe, expect, it } from 'vitest';
import { masteryScore, type ScoredAnswer } from './mastery';

const now = new Date('2026-11-06T09:00:00Z');
const daysAgo = (days: number) =>
	new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
const answers = (count: number, correct: boolean, days = 0): ScoredAnswer[] =>
	Array.from({ length: count }, () => ({ correct, answeredAt: daysAgo(days) }));

describe('masteryScore', () => {
	it('gives no score to a topic with no answers', () => {
		expect(masteryScore([], now)).toBeNull();
	});

	it('gives 0 when every answer is wrong', () => {
		expect(masteryScore(answers(5, false), now)).toBe(0);
	});

	it('comes close to 100 when every answer is right', () => {
		expect(masteryScore(answers(1, true), now)).toBe(50);
		expect(masteryScore(answers(4, true), now)).toBe(80);
		expect(masteryScore(answers(19, true), now)).toBe(95);
	});

	it('counts recent answers more than old ones', () => {
		const improved = [...answers(5, false, 30), ...answers(5, true)];
		const forgot = [...answers(5, true, 30), ...answers(5, false)];

		expect(masteryScore(improved, now)).toBe(70);
		expect(masteryScore(forgot, now)).toBe(16);
	});

	it('halves the weight of an answer every two weeks', () => {
		const twoWeeksAgo = [...answers(2, true, 14), ...answers(1, false)];

		expect(masteryScore(twoWeeksAgo, now)).toBe(33);
	});

	it('goes down for a topic the student stops studying', () => {
		const studied = (days: number) =>
			masteryScore(answers(10, true, days), now);

		expect(studied(0)).toBe(91);
		expect(studied(28)).toBe(71);
		expect(studied(90)).toBe(10);
	});

	it('counts an answer from a moment ahead of the clock as new', () => {
		const ahead = new Date(now.getTime() + 60_000);

		expect(masteryScore([{ correct: true, answeredAt: ahead }], now)).toBe(50);
	});
});

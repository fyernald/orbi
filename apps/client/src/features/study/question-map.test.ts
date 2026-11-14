import type { SessionAnswer } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { questionMap, resultOf } from './question-map';

const answer = (correct: boolean): SessionAnswer => ({
	questionId: 'q1',
	choice: 0,
	correct,
	correctChoice: 0,
	explanation: null,
});

describe('resultOf', () => {
	it.each([
		[undefined, 'waiting'],
		[null, 'skipped'],
		[answer(true), 'correct'],
		[answer(false), 'wrong'],
	] as const)('marks %o as %s', (given, result) => {
		expect(resultOf(given)).toBe(result);
	});
});

describe('questionMap', () => {
	it('marks each question and the current one', () => {
		const run = { index: 2, answers: [answer(true), null] };
		expect(questionMap(run, 4)).toEqual([
			{ number: 1, result: 'correct', current: false },
			{ number: 2, result: 'skipped', current: false },
			{ number: 3, result: 'waiting', current: true },
			{ number: 4, result: 'waiting', current: false },
		]);
	});

	it('shows the result of the current question once it is answered', () => {
		const run = { index: 0, answers: [answer(false)] };
		expect(questionMap(run, 2)[0]).toEqual({
			number: 1,
			result: 'wrong',
			current: true,
		});
	});

	it('has no current question when the run is over', () => {
		const run = { index: 2, answers: [answer(true), answer(false)] };
		expect(questionMap(run, 2).some(({ current }) => current)).toBe(false);
	});
});

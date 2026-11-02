import type { SessionAnswer } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import {
	choiceForKey,
	isAnswered,
	isFinished,
	nextQuestion,
	recordAnswer,
	skipQuestion,
	startRun,
	summarize,
	summaryHeadline,
} from './session';

const answer = (questionId: string, correct: boolean): SessionAnswer => ({
	questionId,
	choice: correct ? 1 : 0,
	correct,
	correctChoice: 1,
	explanation: null,
});

describe('a study run', () => {
	it('moves on only after the shown question is answered', () => {
		const run = startRun();
		expect(nextQuestion(run)).toBe(run);

		const answered = recordAnswer(run, answer('q1', true));
		expect(isAnswered(answered)).toBe(true);

		const next = nextQuestion(answered);
		expect(next.index).toBe(1);
		expect(isAnswered(next)).toBe(false);
	});

	it('keeps the first answer to a question', () => {
		const run = recordAnswer(startRun(), answer('q1', true));

		expect(recordAnswer(run, answer('q1', false))).toBe(run);
	});

	it('skips a question without an answer', () => {
		const run = skipQuestion(startRun());

		expect(run).toEqual({ index: 1, answers: [null] });
	});

	it('is finished after the last question', () => {
		let run = startRun();
		run = nextQuestion(recordAnswer(run, answer('q1', true)));
		expect(isFinished(run, 2)).toBe(false);

		run = nextQuestion(recordAnswer(run, answer('q2', false)));
		expect(isFinished(run, 2)).toBe(true);
	});
});

describe('summarize', () => {
	it('counts the answered questions and the correct ones', () => {
		expect(summarize([answer('q1', true), null, answer('q3', false)])).toEqual({
			total: 2,
			correct: 1,
		});
	});
});

describe('summaryHeadline', () => {
	it('praises a perfect session', () => {
		expect(summaryHeadline({ total: 5, correct: 5 })).toBe(
			'All correct. Well done!'
		);
	});

	it('encourages a session with many wrong answers', () => {
		expect(summaryHeadline({ total: 5, correct: 2 })).toBe(
			'Keep going, you are learning'
		);
	});
});

describe('choiceForKey', () => {
	it('maps numbers and letters to a choice', () => {
		expect(choiceForKey('1', 4)).toBe(0);
		expect(choiceForKey('4', 4)).toBe(3);
		expect(choiceForKey('b', 4)).toBe(1);
		expect(choiceForKey('D', 4)).toBe(3);
	});

	it('ignores keys outside the choices', () => {
		expect(choiceForKey('5', 4)).toBeNull();
		expect(choiceForKey('0', 4)).toBeNull();
		expect(choiceForKey('e', 4)).toBeNull();
		expect(choiceForKey('Enter', 4)).toBeNull();
		expect(choiceForKey(' ', 4)).toBeNull();
	});
});

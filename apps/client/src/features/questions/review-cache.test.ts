import type { Question, ReviewTopic } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import {
	approveTopic,
	pendingCount,
	pendingIn,
	replaceQuestion,
} from './review-cache';

const question = (id: string, topicId: string, status: Question['status']) =>
	({
		id,
		topicId,
		type: 'multiple_choice',
		text: `Question ${id}`,
		choices: ['A', 'B', 'C', 'D'],
		correctChoice: 0,
		explanation: null,
		status,
		createdAt: '2026-11-01T10:00:00.000Z',
	}) satisfies Question;

const group = (topicId: string, questions: Question[]): ReviewTopic => ({
	courseId: 'course',
	courseName: 'Biology 101',
	courseColor: 'teal',
	topicId,
	topicName: topicId,
	questions,
});

const groups = [
	group('cells', [
		question('1', 'cells', 'pending'),
		question('2', 'cells', 'rejected'),
		question('3', 'cells', 'pending'),
	]),
	group('dna', [question('4', 'dna', 'pending')]),
];

describe('replaceQuestion', () => {
	it('keeps the question in its place with the new status', () => {
		const next = replaceQuestion(groups, question('3', 'cells', 'approved'));

		expect(next[0]!.questions.map(({ status }) => status)).toEqual([
			'pending',
			'rejected',
			'approved',
		]);
		expect(next[1]).toBe(groups[1]);
	});
});

describe('approveTopic', () => {
	it('approves only the pending questions of that topic', () => {
		const next = approveTopic(groups, 'cells');

		expect(next[0]!.questions.map(({ status }) => status)).toEqual([
			'approved',
			'rejected',
			'approved',
		]);
		expect(next[1]).toBe(groups[1]);
	});
});

describe('pending counts', () => {
	it('counts only the questions still waiting', () => {
		expect(pendingIn(groups[0]!.questions)).toBe(2);
		expect(pendingCount(groups)).toBe(3);
		expect(pendingCount(approveTopic(groups, 'cells'))).toBe(1);
	});
});

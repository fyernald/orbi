import type { Course, Topic } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { tutorStarters } from './tutor-starters';

const course: Course = {
	id: 'c1',
	name: 'Biology 101',
	description: null,
	color: 'blue',
	goal: 'keep_up',
	examDate: null,
	topicCount: 2,
	noteCount: 0,
	lastActivityAt: '2026-10-01T10:00:00.000Z',
};

const topic = (id: string, name: string, position: number): Topic => ({
	id,
	courseId: 'c1',
	name,
	position,
	noteCount: 0,
});

const topics = [topic('t1', 'Mitosis', 0), topic('t2', 'Genetics', 1)];

describe('tutorStarters', () => {
	it('suggests nothing before the course has topics', () => {
		expect(tutorStarters(course, [])).toEqual([]);
	});

	it('uses the topics of the course', () => {
		expect(tutorStarters(course, topics).map((s) => s.label)).toEqual([
			'Explain Mitosis simply',
			'Quiz me on Genetics',
			'Flashcards for Mitosis',
		]);
	});

	it('adds a mock exam when the course is for an exam', () => {
		const starters = tutorStarters({ ...course, goal: 'exam_prep' }, topics);
		expect(starters.at(-1)?.action).toBe('mockExam');
	});
});

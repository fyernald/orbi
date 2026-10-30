import type { Course } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { courseStatus } from './course-status';

const course = (fields: Partial<Course>): Course => ({
	id: 'biology',
	name: 'Biology 101',
	description: null,
	color: 'teal',
	goal: 'exam_prep',
	examDate: null,
	topicCount: 0,
	noteCount: 0,
	lastActivityAt: '2026-10-29T10:00:00.000Z',
	...fields,
});

const now = new Date(2026, 9, 30, 12, 0);

describe('courseStatus', () => {
	it('asks for topics first', () => {
		expect(courseStatus(course({}), now)).toBe('No topics yet');
	});

	it('asks for notes once there are topics', () => {
		expect(courseStatus(course({ topicCount: 3 }), now)).toBe(
			'3 topics · add notes to get questions'
		);
	});

	it('sums up a course with notes', () => {
		expect(courseStatus(course({ topicCount: 3, noteCount: 1 }), now)).toBe(
			'3 topics · 1 note · active yesterday'
		);
	});
});

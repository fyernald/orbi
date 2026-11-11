import type { Course } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { courseTitle } from './course-title';

const biology: Course = {
	id: '13c80280-44a1-4ab7-9285-7c2db8468c7e',
	name: 'Biology 101',
	description: null,
	color: 'teal',
	goal: 'exam_prep',
	examDate: null,
	topicCount: 2,
	noteCount: 3,
	lastActivityAt: '2026-11-07T09:00:00.000Z',
};

describe('courseTitle', () => {
	it('names the course', () => {
		expect(courseTitle({ status: 'found', course: biology })).toBe(
			'Biology 101'
		);
	});

	it('says the course is not found for a wrong link', () => {
		expect(courseTitle({ status: 'missing' })).toBe('Course not found');
	});

	it('says Course when the API cannot answer', () => {
		expect(courseTitle({ status: 'unavailable' })).toBe('Course');
	});
});

import type { Course } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { groupCourses } from './course-groups';

const course = (name: string, fields: Partial<Course> = {}): Course => ({
	id: name,
	name,
	description: null,
	color: 'blue',
	goal: 'keep_up',
	examDate: null,
	topicCount: 0,
	noteCount: 0,
	lastActivityAt: '2026-10-01T10:00:00.000Z',
	...fields,
});

const now = new Date(2026, 9, 30, 12, 0);

const summary = (courses: Course[]) =>
	groupCourses(courses, now).map(({ id, courses }) => [
		id,
		courses.map(({ name }) => name),
	]);

describe('groupCourses', () => {
	it('puts each course in a group by how close its exam is', () => {
		const courses = [
			course('No date'),
			course('Next month', { examDate: '2026-11-30' }),
			course('In two weeks', { examDate: '2026-11-13' }),
			course('Next week', { examDate: '2026-11-06' }),
		];
		expect(summary(courses)).toEqual([
			['soon', ['Next week', 'In two weeks']],
			['later', ['Next month']],
			['none', ['No date']],
		]);
	});

	it('treats a past exam like no exam, the latest activity first', () => {
		const courses = [
			course('Old'),
			course('Exam over', {
				examDate: '2026-10-20',
				lastActivityAt: '2026-10-29T10:00:00.000Z',
			}),
		];
		expect(summary(courses)).toEqual([['none', ['Exam over', 'Old']]]);
	});

	it('leaves out empty groups', () => {
		expect(summary([])).toEqual([]);
	});
});

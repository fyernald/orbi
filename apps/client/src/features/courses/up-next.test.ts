import type { Course } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { upNextCourse } from './up-next';

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

describe('upNextCourse', () => {
	it('picks the nearest exam that is still to come', () => {
		const courses = [
			course('Past', { examDate: '2026-10-20' }),
			course('Later', { examDate: '2026-12-01' }),
			course('Soon', { examDate: '2026-11-05' }),
		];
		expect(upNextCourse(courses, now)?.name).toBe('Soon');
	});

	it('falls back to the latest activity', () => {
		const courses = [
			course('Old'),
			course('Recent', { lastActivityAt: '2026-10-29T10:00:00.000Z' }),
		];
		expect(upNextCourse(courses, now)?.name).toBe('Recent');
	});

	it('has nothing without courses', () => {
		expect(upNextCourse([], now)).toBeUndefined();
	});
});

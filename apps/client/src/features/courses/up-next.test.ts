import type { Course } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { upNextCourse, upNextStep } from './up-next';

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

describe('upNextStep', () => {
	it('asks for topics, then notes', () => {
		expect(upNextStep(course('Biology'), now).action).toBe('Add topics');
		expect(upNextStep(course('Biology', { topicCount: 2 }), now).action).toBe(
			'Add notes'
		);
	});

	it('carries on with the exam ahead', () => {
		const step = upNextStep(
			course('Biology', {
				topicCount: 2,
				noteCount: 3,
				examDate: '2026-11-11',
				lastActivityAt: '2026-10-29T10:00:00.000Z',
			}),
			now
		);
		expect(step).toEqual({
			title: 'Continue Biology',
			detail: 'Exam in 12 days. Last active yesterday.',
			action: 'Open course',
		});
	});
});

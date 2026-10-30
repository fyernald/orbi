import type { Course } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { coursesSummary } from './courses-summary';

const course = (name: string, examDate: string | null = null): Course => ({
	id: name,
	name,
	description: null,
	color: 'blue',
	goal: 'exam_prep',
	examDate,
	topicCount: 0,
	noteCount: 0,
	lastActivityAt: '2026-10-01T10:00:00.000Z',
});

const now = new Date(2026, 9, 30, 12, 0);

describe('coursesSummary', () => {
	it('names the nearest exam and counts the others', () => {
		const courses = [
			course('Linear Algebra', '2026-11-18'),
			course('Biology 101', '2026-11-11'),
			course('Chemistry', '2026-12-02'),
		];
		expect(coursesSummary(courses, now)).toBe(
			'Biology 101 exam in 12 days. 2 more exams after that.'
		);
	});

	it.each([
		['2026-10-30', 'Biology 101 exam is today.'],
		['2026-10-31', 'Biology 101 exam is tomorrow.'],
	])('says when the only exam is %s', (examDate, sentence) => {
		expect(coursesSummary([course('Biology 101', examDate)], now)).toBe(
			sentence
		);
	});

	it('ignores exams that are over', () => {
		expect(coursesSummary([course('Old', '2026-10-01')], now)).toBe(
			'No exams coming up.'
		);
	});
});

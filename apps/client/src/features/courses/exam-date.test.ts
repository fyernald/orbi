import type { Course } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { coursesWithExamAhead, examCountdown, upcomingExam } from './exam-date';

// late in the evening, when UTC is already the next day in some places
const now = new Date(2026, 9, 30, 23, 30);

const course = (name: string, examDate: string | null): Course => ({
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

describe('examCountdown', () => {
	it.each([
		['2026-10-30', 'Exam today'],
		['2026-10-31', 'Exam tomorrow'],
		['2026-11-22', 'Exam in 23 days'],
		['2026-10-29', 'Exam was yesterday'],
		['2026-10-20', 'Exam was 10 days ago'],
	])('%s is "%s"', (examDate, label) => {
		expect(examCountdown(examDate, now)).toBe(label);
	});
});

describe('upcomingExam', () => {
	it.each([
		['2026-10-30', '2026-10-30'],
		['2026-10-29', null],
		[null, null],
	])('%s gives %s', (examDate, expected) => {
		expect(upcomingExam({ examDate }, now)).toBe(expected);
	});
});

describe('coursesWithExamAhead', () => {
	it('keeps the exams still ahead, the nearest first', () => {
		const courses = [
			course('Later', '2026-12-01'),
			course('Over', '2026-10-01'),
			course('None', null),
			course('Soon', '2026-11-05'),
		];
		expect(coursesWithExamAhead(courses, now).map(({ name }) => name)).toEqual([
			'Soon',
			'Later',
		]);
	});
});

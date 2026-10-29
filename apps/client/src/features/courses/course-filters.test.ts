import type { Course } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { filterCourses } from './course-filters';

const course = (fields: Partial<Course>): Course => ({
	id: crypto.randomUUID(),
	name: 'Course',
	description: null,
	color: 'blue',
	goal: 'keep_up',
	examDate: null,
	topicCount: 0,
	noteCount: 0,
	lastActivityAt: '2026-10-01T10:00:00.000Z',
	...fields,
});

const biology = course({
	name: 'Biology 101',
	description: 'Cells and genetics',
	goal: 'exam_prep',
	examDate: '2026-12-01',
	lastActivityAt: '2026-10-20T10:00:00.000Z',
});
const calculus = course({
	name: 'calculus II',
	goal: 'exam_prep',
	examDate: '2026-11-10',
	lastActivityAt: '2026-10-25T10:00:00.000Z',
});
const art = course({ name: 'Art history', goal: 'self_study' });
const all = [biology, calculus, art];

const names = (courses: Course[]) => courses.map((item) => item.name);

describe('filterCourses', () => {
	it('finds words in the name and the description', () => {
		expect(
			names(
				filterCourses(all, { query: 'genetics', goal: 'all', sort: 'name' })
			)
		).toEqual(['Biology 101']);
	});

	it('keeps only the chosen goal', () => {
		expect(
			names(filterCourses(all, { query: '', goal: 'self_study', sort: 'name' }))
		).toEqual(['Art history']);
	});

	it('sorts by name without caring about capitals', () => {
		expect(
			names(filterCourses(all, { query: '', goal: 'all', sort: 'name' }))
		).toEqual(['Art history', 'Biology 101', 'calculus II']);
	});

	it('puts the nearest exam first and courses without one last', () => {
		expect(
			names(filterCourses(all, { query: '', goal: 'all', sort: 'exam' }))
		).toEqual(['calculus II', 'Biology 101', 'Art history']);
	});

	it('puts the most recent activity first', () => {
		expect(
			names(filterCourses(all, { query: '', goal: 'all', sort: 'recent' }))
		).toEqual(['calculus II', 'Biology 101', 'Art history']);
	});
});

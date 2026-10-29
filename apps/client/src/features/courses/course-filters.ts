import type { Course, CourseGoal } from '@orbi/shared';

export type CourseSort = 'recent' | 'exam' | 'name';

export type CourseFilters = {
	query: string;
	goal: CourseGoal | 'all';
	sort: CourseSort;
};

const byName = (a: Course, b: Course) =>
	a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });

const compare: Record<CourseSort, (a: Course, b: Course) => number> = {
	recent: (a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt),
	// the nearest exam first; courses without a date go last
	exam: (a, b) => {
		if (a.examDate === b.examDate) return byName(a, b);
		if (!a.examDate) return 1;
		if (!b.examDate) return -1;
		return a.examDate.localeCompare(b.examDate);
	},
	name: byName,
};

export function filterCourses(
	courses: Course[],
	{ query, goal, sort }: CourseFilters
): Course[] {
	const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
	// filter makes a new array, so sorting it leaves the cached list alone
	return courses
		.filter((course) => goal === 'all' || course.goal === goal)
		.filter((course) => {
			const text = `${course.name} ${course.description ?? ''}`.toLowerCase();
			return words.every((word) => text.includes(word));
		})
		.sort(compare[sort]);
}

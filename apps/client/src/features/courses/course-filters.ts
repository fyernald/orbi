import type { Course, CourseGoal } from '@orbi/shared';

export type CourseFilters = {
	query: string;
	goal: CourseGoal | 'all';
};

// the courses that match the search and the goal, the most recently active first
export function filterCourses(
	courses: Course[],
	{ query, goal }: CourseFilters
): Course[] {
	const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
	// filter makes a new array, so sorting it leaves the cached list alone
	return courses
		.filter((course) => goal === 'all' || course.goal === goal)
		.filter((course) => {
			const text = `${course.name} ${course.description ?? ''}`.toLowerCase();
			return words.every((word) => text.includes(word));
		})
		.sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));
}

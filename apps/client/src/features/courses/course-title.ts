import type { Course } from '@orbi/shared';

// what the Next.js server learned about a course before the page renders
export type ServerCourse =
	| { status: 'found'; course: Course }
	// a wrong link, or a course of another user
	| { status: 'missing' }
	// the API could not answer (down, or a crash)
	| { status: 'unavailable' };

// the course page's tab: the course name, so open courses can be told apart
export function courseTitle(result: ServerCourse): string {
	switch (result.status) {
		case 'found':
			return result.course.name;
		case 'missing':
			return 'Course not found';
		case 'unavailable':
			return 'Course';
	}
}

import type { Course } from '@orbi/shared';
import { daysUntil, upcomingExam } from './exam-date';

// an exam this close counts as soon
const SOON_DAYS = 14;

export type CourseGroupId = 'soon' | 'later' | 'none';

export type CourseGroup = {
	id: CourseGroupId;
	courses: Course[];
};

function groupOf(course: Course, now: Date): CourseGroupId {
	const examDate = upcomingExam(course, now);
	if (!examDate) return 'none';
	return daysUntil(examDate, now) <= SOON_DAYS ? 'soon' : 'later';
}

const byExamDate = (a: Course, b: Course) =>
	a.examDate!.localeCompare(b.examDate!);
const byLatestActivity = (a: Course, b: Course) =>
	b.lastActivityAt.localeCompare(a.lastActivityAt);

// the courses by how close their exam is, the nearest first; empty groups are left out
export function groupCourses(courses: Course[], now: Date): CourseGroup[] {
	const ids: CourseGroupId[] = ['soon', 'later', 'none'];
	return ids
		.map((id) => ({
			id,
			courses: courses
				.filter((course) => groupOf(course, now) === id)
				.sort(id === 'none' ? byLatestActivity : byExamDate),
		}))
		.filter((group) => group.courses.length > 0);
}

// all courses in one list: the nearest exam first, then the rest by latest activity
export function orderCourses(courses: Course[], now: Date): Course[] {
	return groupCourses(courses, now).flatMap((group) => group.courses);
}

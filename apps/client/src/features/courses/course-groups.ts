import type { Course } from '@orbi/shared';
import { daysUntil } from './exam-date';

// an exam this close counts as soon
const SOON_DAYS = 14;

export type CourseGroupId = 'soon' | 'later' | 'none';

export type CourseGroup = {
	id: CourseGroupId;
	title: string;
	courses: Course[];
};

const titles: Record<CourseGroupId, string> = {
	soon: 'Exam in the next two weeks',
	later: 'Exam later',
	none: 'No exam coming up',
};

function groupOf(course: Course, now: Date): CourseGroupId {
	if (!course.examDate) return 'none';
	const days = daysUntil(course.examDate, now);
	if (days < 0) return 'none';
	return days <= SOON_DAYS ? 'soon' : 'later';
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
			title: titles[id],
			courses: courses
				.filter((course) => groupOf(course, now) === id)
				.sort(id === 'none' ? byLatestActivity : byExamDate),
		}))
		.filter((group) => group.courses.length > 0);
}

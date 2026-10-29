import type { Course } from '@orbi/shared';
import { daysUntil } from './exam-date';

// the course to study next: the nearest exam still to come, else the latest activity
export function upNextCourse(courses: Course[], now: Date): Course | undefined {
	const nextExam = courses
		.filter((course) => course.examDate && daysUntil(course.examDate, now) >= 0)
		.sort((a, b) => a.examDate!.localeCompare(b.examDate!))[0];
	if (nextExam) return nextExam;
	return courses
		.slice()
		.sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt))[0];
}

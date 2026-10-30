import type { Course } from '@orbi/shared';
import { formatTimeAgo } from '@/lib/dates';
import { daysUntil, examCountdown } from './exam-date';

export type UpNextStep = {
	title: string;
	detail: string;
	action: string;
};

// what to do next in the up-next course: add what is missing, else carry on
export function upNextStep(course: Course, now: Date): UpNextStep {
	if (course.topicCount === 0) {
		return {
			title: `Add topics to ${course.name}`,
			detail: 'Orbi quizzes you one topic at a time.',
			action: 'Add topics',
		};
	}
	if (course.noteCount === 0) {
		return {
			title: `Add notes to ${course.name}`,
			detail: 'Orbi makes practice questions from your notes.',
			action: 'Add notes',
		};
	}
	const lastActive = `Last active ${formatTimeAgo(course.lastActivityAt, now)}.`;
	const examAhead =
		course.examDate && daysUntil(course.examDate, now) >= 0
			? `${examCountdown(course.examDate, now)}. `
			: '';
	return {
		title: `Continue ${course.name}`,
		detail: examAhead + lastActive,
		action: 'Open course',
	};
}

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

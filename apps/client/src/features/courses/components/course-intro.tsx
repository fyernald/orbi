import type { Course } from '@orbi/shared';
import { formatShortDate } from '@/lib/dates';
import { examCountdown, upcomingExam } from '../exam-date';
import { goals } from '../goals';
import { MasteryRing } from './mastery-ring';

// what the course is working towards: the exam ahead, else its goal
function timeline(course: Course, now: Date): string {
	const examDate = upcomingExam(course, now);
	if (examDate) {
		return `${examCountdown(examDate, now)} · ${formatShortDate(examDate)}`;
	}
	return goals[course.goal].shortLabel;
}

// the top of the topics pane: where the course stands
export function CourseIntro({ course }: { course: Course }) {
	return (
		<div className="flex flex-col gap-4 px-4 pt-4 pb-2">
			<p className="text-sm text-subtle-foreground">
				{timeline(course, new Date())}
			</p>
			<div className="flex items-center gap-3">
				{/* the mastery score comes with the review scheduler in Sprint 3 */}
				<MasteryRing value={null} color={course.color} className="size-14" />
				<p className="text-sm text-muted-foreground">
					Mastery shows after your first study session.
				</p>
			</div>
			{course.description && (
				<p className="line-clamp-3 text-sm leading-relaxed text-subtle-foreground">
					{course.description}
				</p>
			)}
		</div>
	);
}

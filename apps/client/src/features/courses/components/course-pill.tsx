import type { Course } from '@orbi/shared';
import { CalendarClock } from 'lucide-react';
import { formatShortDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { daysUntil, examCountdown, upcomingExam } from '../exam-date';
import { goals } from '../goals';

// in the last week before an exam, the pill turns to the warning colour
const SOON_DAYS = 7;

const pill =
	'inline-flex h-6 w-fit max-w-full items-center gap-1.5 rounded-full px-2.5 text-xs font-medium';

type CoursePillProps = {
	course: Course;
	now: Date;
};

// the exam ahead and its date, else what the course is for
export function CoursePill({ course, now }: CoursePillProps) {
	const examDate = upcomingExam(course, now);

	if (examDate) {
		const soon = daysUntil(examDate, now) <= SOON_DAYS;
		return (
			<span
				className={cn(
					pill,
					soon
						? 'bg-tone-amber text-tone-amber-foreground'
						: 'bg-muted text-subtle-foreground'
				)}
			>
				<CalendarClock className="size-3.5 shrink-0" />
				<span className="truncate">
					{examCountdown(examDate, now)} · {formatShortDate(examDate)}
				</span>
			</span>
		);
	}

	const goal = goals[course.goal];
	const GoalIcon = goal.icon;
	return (
		<span className={cn(pill, 'bg-muted text-muted-foreground')}>
			<GoalIcon className="size-3.5 shrink-0" />
			{goal.shortLabel}
		</span>
	);
}

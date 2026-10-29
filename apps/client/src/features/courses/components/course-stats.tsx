import type { Course } from '@orbi/shared';
import { CalendarClock, FileText, Layers } from 'lucide-react';
import { examCountdown, formatExamDate } from '../exam-date';
import { goals } from '../goals';
import { CourseStat } from './course-stat';

type CourseStatsProps = {
	course: Course;
	// undefined while the topics are loading
	noteCount: number | undefined;
};

export function CourseStats({ course, noteCount }: CourseStatsProps) {
	const goal = goals[course.goal];

	return (
		<dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-xs sm:grid-cols-4">
			<CourseStat icon={<Layers />} label="Topics">
				{course.topicCount}
			</CourseStat>
			<CourseStat icon={<FileText />} label="Notes">
				{noteCount ?? '–'}
			</CourseStat>
			<CourseStat
				icon={<CalendarClock />}
				label="Exam"
				hint={
					course.examDate
						? examCountdown(course.examDate, new Date())
						: undefined
				}
			>
				{course.examDate ? formatExamDate(course.examDate) : 'No date'}
			</CourseStat>
			<CourseStat icon={<goal.icon />} label="Goal">
				{goal.shortLabel}
			</CourseStat>
		</dl>
	);
}

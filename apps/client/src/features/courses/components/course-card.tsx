import type { Course } from '@orbi/shared';
import { CalendarClock, ChevronRight, Layers } from 'lucide-react';
import Link from 'next/link';
import { courseRoute } from '@/lib/routes';
import { examCountdown } from '../exam-date';
import { goals } from '../goals';
import { topicCountLabel } from '../topic-count';
import { CourseBadge } from './course-badge';

export function CourseCard({ course }: { course: Course }) {
	const goal = goals[course.goal];

	return (
		<Link
			href={courseRoute(course.id)}
			className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-foreground/15 hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
		>
			<div className="flex items-start gap-3">
				<CourseBadge
					course={course}
					className="h-10 min-w-12 rounded-xl text-xs"
				/>
				<div className="flex min-w-0 flex-1 flex-col gap-0.5">
					<span className="truncate font-medium">{course.name}</span>
					<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<goal.icon className="size-3.5" />
						{goal.shortLabel}
					</span>
				</div>
				<ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
			</div>
			<div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
				<span className="flex items-center gap-1.5">
					<Layers className="size-4" />
					{topicCountLabel(course.topicCount)}
				</span>
				{course.examDate && (
					<span className="flex items-center gap-1.5">
						<CalendarClock className="size-4" />
						{examCountdown(course.examDate, new Date())}
					</span>
				)}
			</div>
		</Link>
	);
}

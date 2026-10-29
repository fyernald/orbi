import type { Course } from '@orbi/shared';
import { examCountdown } from '../exam-date';
import { goals } from '../goals';
import { noteCountLabel } from '../note-count';
import { topicCountLabel } from '../topic-count';
import { CourseBadge } from './course-badge';

// the top of the tutor pane before a conversation starts, like a notebook's cover
export function CourseIntro({ course }: { course: Course }) {
	const facts = [
		topicCountLabel(course.topicCount),
		noteCountLabel(course.noteCount),
		course.examDate
			? examCountdown(course.examDate, new Date())
			: goals[course.goal].shortLabel,
	];

	return (
		<header className="flex flex-col gap-4">
			<CourseBadge course={course} className="size-12 rounded-xl text-sm" />
			<div className="flex flex-col gap-1.5">
				<h1 className="text-2xl font-semibold tracking-tight break-words sm:text-3xl">
					{course.name}
				</h1>
				<p className="text-sm text-muted-foreground">{facts.join(' · ')}</p>
			</div>
			{course.description && (
				<p className="leading-relaxed text-subtle-foreground">
					{course.description}
				</p>
			)}
		</header>
	);
}

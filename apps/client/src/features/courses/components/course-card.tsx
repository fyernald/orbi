import type { Course } from '@orbi/shared';
import Link from 'next/link';
import { formatTimeAgo } from '@/lib/dates';
import { courseRoute } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { courseShortName } from '../badge';
import { covers } from '../covers';
import { goals } from '../goals';
import { noteCountLabel } from '../note-count';
import { topicCountLabel } from '../topic-count';
import { CourseActions } from './course-actions';
import { ExamPill } from './exam-pill';
import { StudyShortcuts } from './study-shortcuts';

type CourseCardProps = {
	course: Course;
	now: Date;
};

// a course as a cover, like a notebook or a deck; the name link covers the whole card,
// and the menu and shortcuts sit above it
export function CourseCard({ course, now }: CourseCardProps) {
	const cover = covers[course.color];
	const goal = goals[course.goal];

	return (
		<article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md focus-within:shadow-md">
			<div
				className={cn(
					'relative flex h-32 items-start justify-between overflow-hidden p-3',
					cover.cover
				)}
			>
				<span
					aria-hidden="true"
					className={cn(
						'pointer-events-none absolute -right-2 -bottom-6 text-8xl leading-none font-bold tracking-tighter select-none',
						cover.initials
					)}
				>
					{courseShortName(course.name)}
				</span>
				<span className="relative inline-flex h-6 items-center gap-1 rounded-md bg-card/80 px-2 text-xs font-medium text-foreground backdrop-blur-sm">
					<goal.icon className="size-3.5" />
					{goal.shortLabel}
				</span>
				<div className="relative z-10 rounded-lg bg-card/80 backdrop-blur-sm">
					<CourseActions course={course} variant="row" />
				</div>
				{course.examDate && (
					<ExamPill
						examDate={course.examDate}
						now={now}
						className="absolute bottom-3 left-3"
					/>
				)}
			</div>
			<div className="flex flex-1 flex-col gap-1 p-4 pb-3">
				<h3 className="truncate font-medium">
					<Link
						href={courseRoute(course.id)}
						className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
					>
						{course.name}
					</Link>
				</h3>
				<p className="text-sm text-muted-foreground">
					{topicCountLabel(course.topicCount)} ·{' '}
					{noteCountLabel(course.noteCount).toLowerCase()}
				</p>
				<div className="mt-auto flex items-center justify-between gap-2 pt-3">
					<span className="text-xs text-muted-foreground">
						Active {formatTimeAgo(course.lastActivityAt, now)}
					</span>
					<StudyShortcuts
						courseId={course.id}
						actions={['ask', 'questions', 'flashcards']}
						compact
						className="relative z-10"
					/>
				</div>
			</div>
		</article>
	);
}

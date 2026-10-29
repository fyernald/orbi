'use client';

import type { Course } from '@orbi/shared';
import { ArrowRight, ArrowUp, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { formatTimeAgo } from '@/lib/dates';
import { courseRoute } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { covers } from '../covers';
import { examCountdown } from '../exam-date';
import { noteCountLabel } from '../note-count';
import { topicCountLabel } from '../topic-count';
import { CourseBadge } from './course-badge';
import { StudyShortcuts } from './study-shortcuts';

type UpNextCardProps = {
	course: Course;
	now: Date;
};

// the course to study next, with the tutor one question away
export function UpNextCard({ course, now }: UpNextCardProps) {
	const router = useRouter();
	const [question, setQuestion] = useState('');

	const ask = (event: FormEvent) => {
		event.preventDefault();
		const text = question.trim();
		router.push(courseRoute(course.id, text ? { ask: text } : {}));
	};

	return (
		<section
			aria-labelledby="up-next-title"
			className={cn(
				'flex flex-col gap-5 rounded-2xl border border-border bg-linear-to-br to-card to-60% p-5 sm:p-6',
				covers[course.color].panel
			)}
		>
			<div className="flex flex-wrap items-start gap-4">
				<CourseBadge
					course={course}
					className="size-12 shrink-0 rounded-xl text-sm shadow-xs"
				/>
				<div className="flex min-w-0 flex-1 flex-col gap-0.5">
					<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
						Up next
					</p>
					<h2 id="up-next-title" className="truncate text-xl font-semibold">
						{course.name}
					</h2>
					<p className="text-sm text-muted-foreground">
						{[
							course.examDate && examCountdown(course.examDate, now),
							topicCountLabel(course.topicCount),
							noteCountLabel(course.noteCount),
							`active ${formatTimeAgo(course.lastActivityAt, now)}`,
						]
							.filter(Boolean)
							.join(' · ')}
					</p>
				</div>
				<Button asChild className="h-9 rounded-lg px-3.5">
					<Link href={courseRoute(course.id)}>
						Open study space
						<ArrowRight />
					</Link>
				</Button>
			</div>

			<form
				onSubmit={ask}
				className="flex items-center gap-2 rounded-xl border border-border bg-card py-1.5 pr-1.5 pl-3 shadow-xs transition-colors focus-within:border-primary"
			>
				<Sparkles className="size-4 shrink-0 text-primary" />
				<input
					value={question}
					onChange={(event) => setQuestion(event.target.value)}
					placeholder={`Ask Orbi about ${course.name}…`}
					aria-label={`Ask Orbi about ${course.name}`}
					className="h-9 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm"
				/>
				<Button
					type="submit"
					size="icon-lg"
					aria-label="Ask"
					className="rounded-lg"
				>
					<ArrowUp />
				</Button>
			</form>

			<StudyShortcuts
				courseId={course.id}
				actions={
					course.goal === 'exam_prep'
						? ['questions', 'flashcards', 'mockExam']
						: ['questions', 'flashcards']
				}
				className="flex-wrap gap-2"
			/>
		</section>
	);
}

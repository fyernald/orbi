import { BookOpen, Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { OrbiMark } from '@/components/brand/orbi-mark';
import { cn } from '@/lib/utils';

// Small copies of real Orbi screens for the login and sign-up pages. They only show
// what the app already does: the tutor reading notes, practice questions, exam dates.

function GlassCard({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<div
			className={cn(
				'rounded-2xl border border-foreground/10 bg-card/75 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.7)] backdrop-blur-md',
				className
			)}
		>
			{children}
		</div>
	);
}

const choices = [
	{ letter: 'A', text: 'Prophase' },
	{ letter: 'B', text: 'Metaphase', correct: true },
	{ letter: 'C', text: 'Anaphase' },
];

// like a practice question in the tutor chat, after the student answered it
export function QuizPreview() {
	return (
		<GlassCard className="flex w-72 flex-col gap-2.5 p-4">
			<span className="text-[11px] text-muted-foreground tabular-nums">
				Question 2 of 5
			</span>
			<p className="text-sm leading-snug font-medium">
				In which phase do the chromosomes line up in the middle of the cell?
			</p>
			<ul className="flex flex-col gap-1.5">
				{choices.map(({ letter, text, correct }) => (
					<li
						key={letter}
						className={cn(
							'flex items-center gap-2.5 rounded-lg border px-3 py-1.5 text-[13px]',
							correct
								? 'border-tone-green-foreground/40 bg-tone-green text-tone-green-foreground'
								: 'border-border bg-background/60'
						)}
					>
						<span className="text-[11px] font-medium text-muted-foreground">
							{letter}
						</span>
						<span className="flex-1">{text}</span>
						{correct && <Check className="size-3.5" />}
					</li>
				))}
			</ul>
		</GlassCard>
	);
}

// like the top of a tutor reply while Orbi works on it
export function TutorPreview() {
	return (
		<GlassCard className="flex w-68 flex-col gap-2 p-4">
			<span className="flex items-center gap-2 text-[13px] font-semibold">
				<OrbiMark className="size-5" />
				Orbi
			</span>
			<span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
				<BookOpen className="size-3" />
				Read 4 notes from Cell division
			</span>
			<span className="shimmer-text text-[13px] font-medium">
				Writing questions from your notes…
			</span>
		</GlassCard>
	);
}

// like the exam list next to the orbit on the courses page
export function ExamPreview() {
	return (
		<GlassCard className="flex items-center gap-3 rounded-full py-2 pr-5 pl-2">
			<span className="flex size-9 items-center justify-center rounded-full bg-tone-green text-[10px] font-semibold text-tone-green-foreground">
				BIO
			</span>
			<span className="flex flex-col">
				<span className="text-[13px] font-semibold">Biology exam</span>
				<span className="text-[11px] text-muted-foreground">In 12 days</span>
			</span>
		</GlassCard>
	);
}

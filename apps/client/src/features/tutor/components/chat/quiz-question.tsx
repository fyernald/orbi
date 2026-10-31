'use client';

import type { GeneratedQuestion } from '@orbi/shared';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const letters = ['A', 'B', 'C', 'D'];

type QuizQuestionProps = {
	question: GeneratedQuestion;
	number: number;
	total: number;
	// false while the set is still being written or saved
	answerable: boolean;
};

// the answer stays hidden until the student picks one; answering from memory
// helps them learn more than reading the answer does
export function QuizQuestion({
	question,
	number,
	total,
	answerable,
}: QuizQuestionProps) {
	const [picked, setPicked] = useState<number | null>(null);
	const answered = picked !== null;
	const correct = picked === question.correctChoice;

	return (
		<li className="flex flex-col gap-2.5 px-4 py-3.5">
			<span className="text-xs text-muted-foreground tabular-nums">
				Question {number} of {total}
			</span>
			<p className="text-[15px] leading-snug font-medium">{question.text}</p>
			<ul className="flex flex-col gap-1.5">
				{question.choices.map((choice, index) => {
					const isRight = answered && index === question.correctChoice;
					const isWrongPick = answered && index === picked && !correct;
					return (
						<li key={index}>
							<button
								type="button"
								disabled={!answerable || answered}
								onClick={() => setPicked(index)}
								className={cn(
									'flex w-full items-baseline gap-2.5 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm transition-colors enabled:hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-default',
									isRight &&
										'border-tone-green-foreground/40 bg-tone-green text-tone-green-foreground',
									isWrongPick &&
										'border-tone-red-foreground/40 bg-tone-red text-tone-red-foreground'
								)}
							>
								<span className="text-xs font-medium text-muted-foreground">
									{letters[index]}
								</span>
								<span className="min-w-0 flex-1">{choice}</span>
								{isRight && <Check className="size-4 shrink-0 self-center" />}
								{isWrongPick && <X className="size-4 shrink-0 self-center" />}
							</button>
						</li>
					);
				})}
			</ul>
			<div aria-live="polite">
				{answered && (
					<p className="rounded-lg bg-muted px-3 py-2 text-sm text-subtle-foreground">
						<span className="font-medium text-foreground">
							{correct
								? 'Correct. '
								: `Not quite. The answer is ${letters[question.correctChoice]}. `}
						</span>
						{question.explanation}
					</p>
				)}
			</div>
		</li>
	);
}

'use client';

import type { ChatAnswer, GeneratedQuestion } from '@orbi/shared';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { ApiError, apiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';

const letters = ['A', 'B', 'C', 'D'];

type QuizQuestionProps = {
	question: GeneratedQuestion;
	number: number;
	total: number;
	// false while the set is still being written or saved, or its answers load
	answerable: boolean;
	// the answer given before, which is the only one the question takes
	saved?: ChatAnswer;
	onAnswer: (choice: number) => Promise<void>;
};

// The answer stays hidden until the student picks one; answering from memory
// helps them learn more than reading the answer does. Each question takes one
// answer, saved on the server, so it stays answered after a reload.
export function QuizQuestion({
	question,
	number,
	total,
	answerable,
	saved,
	onAnswer,
}: QuizQuestionProps) {
	// shown at once, before the server has saved it
	const [picked, setPicked] = useState<number | null>(null);
	const [error, setError] = useState<string>();
	const choice = saved?.choice ?? picked;
	const answered = choice !== null;
	const correct = choice === question.correctChoice;

	const pick = async (index: number) => {
		setPicked(index);
		setError(undefined);
		try {
			await onAnswer(index);
		} catch (failed) {
			// answered already, for example in another tab: that answer loads instead
			if (failed instanceof ApiError && failed.status === 409) return;
			setPicked(null);
			setError(apiErrorMessage(failed));
		}
	};

	return (
		<li className="flex flex-col gap-2.5 px-4 py-3.5">
			<span className="text-xs text-muted-foreground tabular-nums">
				Question {number} of {total}
			</span>
			<p className="text-[15px] leading-snug font-medium">{question.text}</p>
			<ul className="flex flex-col gap-1.5">
				{question.choices.map((text, index) => {
					const isRight = answered && index === question.correctChoice;
					const isWrongPick = answered && index === choice && !correct;
					return (
						<li key={index}>
							<button
								type="button"
								disabled={!answerable || answered}
								onClick={() => void pick(index)}
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
								<span className="min-w-0 flex-1">{text}</span>
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
				{error && <p className="text-sm text-destructive">{error}</p>}
			</div>
		</li>
	);
}

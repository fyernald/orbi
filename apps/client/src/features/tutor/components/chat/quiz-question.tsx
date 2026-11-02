'use client';

import type { ChatAnswer, GeneratedQuestion } from '@orbi/shared';
import { useState } from 'react';
import { choiceLetter, choiceMark } from '@/features/questions/choices';
import { ChoiceOption } from '@/features/questions/components/choice-option';
import { ApiError, apiErrorMessage } from '@/lib/api';

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
				{question.choices.map((text, index) => (
					<li key={index}>
						<ChoiceOption
							index={index}
							text={text}
							mark={choiceMark(
								index,
								answered
									? { choice, correctChoice: question.correctChoice }
									: undefined
							)}
							disabled={!answerable || answered}
							onPick={() => void pick(index)}
						/>
					</li>
				))}
			</ul>
			<div aria-live="polite">
				{answered && (
					<p className="rounded-lg bg-muted px-3 py-2 text-sm text-subtle-foreground">
						<span className="font-medium text-foreground">
							{correct
								? 'Correct. '
								: `Not quite. The answer is ${choiceLetter(question.correctChoice)}. `}
						</span>
						{question.explanation}
					</p>
				)}
				{error && <p className="text-sm text-destructive">{error}</p>}
			</div>
		</li>
	);
}

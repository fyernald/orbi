'use client';

import type { SessionAnswer, StudyQuestion } from '@orbi/shared';
import { useEffect, useRef, useState } from 'react';
import { KeyHint } from '@/components/key-hint';
import { Button } from '@/components/ui/button';
import { choiceLetter, choiceMark } from '@/features/questions/choices';
import { ChoiceOption } from '@/features/questions/components/choice-option';
import { ApiError, apiErrorMessage } from '@/lib/api';
import { useAnswerInSession } from '../hooks';
import { useChoiceKeys } from '../use-choice-keys';
import { AnswerFeedback } from './answer-feedback';

type SessionQuestionProps = {
	question: StudyQuestion;
	// a new question takes the focus, so a screen reader reads it out
	focusOnShow: boolean;
	answer: SessionAnswer | undefined;
	isLast: boolean;
	onAnswered: (answer: SessionAnswer) => void;
	onSkip: () => void;
	onNext: () => void;
};

// The answer stays on the server until the student picks one, so it is checked
// there and the result comes back with the correct choice and why.
export function SessionQuestion({
	question,
	focusOnShow,
	answer,
	isLast,
	onAnswered,
	onSkip,
	onNext,
}: SessionQuestionProps) {
	const submit = useAnswerInSession();
	const [picked, setPicked] = useState<number | null>(null);
	const heading = useRef<HTMLHeadingElement>(null);
	useEffect(() => {
		if (focusOnShow) heading.current?.focus({ preventScroll: true });
	}, [focusOnShow]);

	// taken out of the study questions in another tab: it cannot be answered here
	const removed =
		submit.error instanceof ApiError && submit.error.status === 409;
	const answerable = !answer && !submit.isPending && !removed;
	const pick = (choice: number) => {
		if (!answerable) return;
		setPicked(choice);
		submit.mutate(
			{ id: question.id, choice },
			{ onSuccess: onAnswered, onError: () => setPicked(null) }
		);
	};
	useChoiceKeys({
		enabled: answerable,
		choiceCount: question.choices.length,
		onPick: pick,
	});

	return (
		<article className="flex flex-col gap-5">
			<h2
				ref={heading}
				tabIndex={-1}
				className="text-xl leading-snug font-medium text-pretty break-words outline-none"
			>
				{question.text}
			</h2>
			<ul className="flex flex-col gap-2">
				{question.choices.map((text, index) => (
					<li key={index}>
						<ChoiceOption
							index={index}
							text={text}
							mark={choiceMark(index, answer)}
							selected={picked === index}
							disabled={!answerable}
							onPick={() => pick(index)}
							className="px-4 py-3 text-[15px]"
						/>
					</li>
				))}
			</ul>
			<div aria-live="polite" className="flex flex-col gap-3">
				{answer && (
					<AnswerFeedback answer={answer} isLast={isLast} onNext={onNext} />
				)}
				{submit.error && (
					<div className="flex flex-wrap items-center gap-3">
						<p className="text-sm text-destructive">
							{apiErrorMessage(submit.error)}
						</p>
						{removed && (
							<Button
								variant="outline"
								onClick={onSkip}
								className="h-8 rounded-full px-3"
							>
								Skip it
							</Button>
						)}
					</div>
				)}
			</div>
			{answerable && (
				<p className="hidden items-center gap-1.5 text-xs text-muted-foreground pointer-fine:flex">
					Press <KeyHint>{choiceLetter(0)}</KeyHint>–
					<KeyHint>{choiceLetter(question.choices.length - 1)}</KeyHint> or{' '}
					<KeyHint>1</KeyHint>–<KeyHint>{question.choices.length}</KeyHint> to
					answer
				</p>
			)}
		</article>
	);
}

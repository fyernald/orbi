'use client';

import type { Question } from '@orbi/shared';
import { useRef, useState } from 'react';
import { AnswerKey } from './answer-key';
import { EditQuestionForm } from './edit-question-form';
import { QuestionActions } from './question-actions';

type QuestionCardProps = {
	courseId: string;
	question: Question;
};

// a question of the topic with its answer showing; it is edited in place
export function QuestionCard({ courseId, question }: QuestionCardProps) {
	const [editing, setEditing] = useState(false);
	const menuButton = useRef<HTMLButtonElement>(null);

	if (editing) {
		return (
			<EditQuestionForm
				courseId={courseId}
				question={question}
				onDone={() => {
					setEditing(false);
					requestAnimationFrame(() => menuButton.current?.focus());
				}}
			/>
		);
	}

	return (
		<article className="flex flex-col gap-3 rounded-xl border border-border px-4 py-3">
			<header className="flex items-start justify-between gap-3">
				<h4 className="min-w-0 pt-0.5 text-sm leading-snug font-medium break-words">
					{question.text}
				</h4>
				<QuestionActions
					courseId={courseId}
					question={question}
					onEdit={() => setEditing(true)}
					triggerRef={menuButton}
				/>
			</header>
			{question.status === 'pending' && (
				<span className="self-start rounded-full bg-tone-amber px-2 py-0.5 text-xs font-medium text-tone-amber-foreground">
					Waiting for your review
				</span>
			)}
			<AnswerKey {...question} />
		</article>
	);
}

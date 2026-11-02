'use client';

import type { Question, QuestionStatus } from '@orbi/shared';
import { Check, RotateCcw, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { FormError } from '@/components/form/form-error';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { apiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useSetQuestionStatus } from '../hooks';
import { AnswerKey } from './answer-key';

type ReviewQuestionCardProps = {
	question: Question;
	number: number;
};

// A question with its answer showing, so the student can judge it. Once decided it
// shrinks to one line with an undo.
export function ReviewQuestionCard({
	question,
	number,
}: ReviewQuestionCardProps) {
	const setStatus = useSetQuestionStatus();
	const pending = setStatus.isPending;
	// the pressed button goes away, so the focus moves to the one that replaces it;
	// "Approve all" in the topic leaves the focus where it is
	const nextFocus = useRef<HTMLButtonElement>(null);
	const decidedHere = useRef(false);
	useEffect(() => {
		if (!decidedHere.current) return;
		decidedHere.current = false;
		nextFocus.current?.focus();
	}, [question.status]);

	const decide = (status: QuestionStatus) => {
		decidedHere.current = true;
		setStatus.mutate({ id: question.id, status });
	};
	const error = setStatus.error ? apiErrorMessage(setStatus.error) : undefined;

	if (question.status !== 'pending') {
		const approved = question.status === 'approved';
		return (
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-2.5 text-sm">
					<span
						className={cn(
							'flex size-6 shrink-0 items-center justify-center rounded-full',
							approved
								? 'bg-tone-green text-tone-green-foreground'
								: 'bg-tone-red text-tone-red-foreground'
						)}
					>
						{approved ? (
							<Check className="size-3.5" />
						) : (
							<X className="size-3.5" />
						)}
					</span>
					<p className="min-w-0 flex-1 truncate text-muted-foreground">
						<span className="font-medium text-foreground">
							{approved ? 'Approved' : 'Rejected'}
						</span>{' '}
						· {question.text}
					</p>
					<Button
						ref={nextFocus}
						variant="ghost"
						size="sm"
						onClick={() => decide('pending')}
						disabled={pending}
						className="h-8 shrink-0 rounded-lg"
					>
						{pending ? <Spinner /> : <RotateCcw />}
						Undo
					</Button>
				</div>
				<FormError message={error} />
			</div>
		);
	}

	return (
		<article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
			<span className="text-xs text-muted-foreground tabular-nums">
				Question {number}
			</span>
			<h3 className="text-[15px] leading-snug font-medium break-words">
				{question.text}
			</h3>
			<AnswerKey {...question} />
			<FormError message={error} />
			<div className="flex flex-wrap justify-end gap-2">
				<Button
					variant="outline"
					onClick={() => decide('rejected')}
					disabled={pending}
					className="h-9 rounded-full px-4"
				>
					<X />
					Reject
				</Button>
				<Button
					ref={nextFocus}
					onClick={() => decide('approved')}
					disabled={pending}
					className="h-9 rounded-full px-4"
				>
					{pending ? <Spinner /> : <Check />}
					Approve
				</Button>
			</div>
		</article>
	);
}

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

const letters = ['A', 'B', 'C', 'D'];

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
			<ul className="flex flex-col gap-1.5">
				{question.choices.map((choice, index) => {
					const correct = index === question.correctChoice;
					return (
						<li
							key={index}
							className={cn(
								'flex items-baseline gap-2.5 rounded-lg border px-3 py-2 text-sm',
								correct
									? 'border-tone-green-foreground/40 bg-tone-green text-tone-green-foreground'
									: 'border-border'
							)}
						>
							<span className="text-xs font-medium text-muted-foreground">
								{letters[index]}
							</span>
							<span className="min-w-0 flex-1 break-words">{choice}</span>
							{correct && (
								<>
									<Check className="size-4 shrink-0 self-center" />
									<span className="sr-only">(correct answer)</span>
								</>
							)}
						</li>
					);
				})}
			</ul>
			{question.explanation && (
				<p className="rounded-lg bg-muted px-3 py-2 text-sm text-subtle-foreground">
					{question.explanation}
				</p>
			)}
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

'use client';

import type { QuestionSet } from '@orbi/shared';
import { CircleHelp } from 'lucide-react';
import { LoadError } from '@/components/load-error';
import { apiErrorMessage } from '@/lib/api';
import { formatTimeAgo } from '@/lib/dates';
import { questionCountLabel } from '../question-count';
import { useQuestionSets } from '../set-hooks';

type QuestionSetListProps = {
	courseId: string;
	onOpen: (set: QuestionSet) => void;
};

// the sets the tutor made in the course, newest first
export function QuestionSetList({ courseId, onOpen }: QuestionSetListProps) {
	const sets = useQuestionSets(courseId);

	if (sets.isPending) {
		return (
			<div
				aria-busy="true"
				aria-label="Loading question sets"
				className="flex flex-col gap-1"
			>
				{[0, 1].map((row) => (
					<div key={row} className="h-12 animate-pulse rounded-lg bg-muted" />
				))}
			</div>
		);
	}
	if (sets.isError) {
		return (
			<LoadError
				message={apiErrorMessage(sets.error)}
				onRetry={() => sets.refetch()}
			/>
		);
	}
	if (sets.data.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Questions, flashcards, and mock exams you make show up here.
			</p>
		);
	}

	const now = new Date();
	return (
		<ul aria-label="Question sets" className="-mx-1 flex flex-col">
			{sets.data.map((set) => (
				<li key={set.id}>
					<button
						type="button"
						onClick={() => onOpen(set)}
						className="flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left text-sm transition-colors outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50"
					>
						<CircleHelp className="size-4 shrink-0 text-muted-foreground" />
						<span className="flex min-w-0 flex-1 flex-col">
							<span className="truncate font-medium">{set.topicName}</span>
							<span className="text-xs text-muted-foreground">
								{questionCountLabel(set.questionCount)} ·{' '}
								{formatTimeAgo(set.createdAt, now)}
							</span>
						</span>
					</button>
				</li>
			))}
		</ul>
	);
}

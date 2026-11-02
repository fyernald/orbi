'use client';

import type { Question } from '@orbi/shared';
import { LoadError } from '@/components/load-error';
import { apiErrorMessage } from '@/lib/api';
import type { UseQueryResult } from '@tanstack/react-query';
import { QuestionCard } from './question-card';

type TopicQuestionsListProps = {
	courseId: string;
	questions: UseQueryResult<Question[]>;
};

// the topic's questions, newest first
export function TopicQuestionsList({
	courseId,
	questions,
}: TopicQuestionsListProps) {
	if (questions.isPending) {
		return (
			<div
				aria-busy="true"
				aria-label="Loading questions"
				className="flex flex-col gap-2"
			>
				{[0, 1].map((row) => (
					<div key={row} className="h-40 animate-pulse rounded-xl bg-muted" />
				))}
			</div>
		);
	}
	if (questions.isError) {
		return (
			<LoadError
				message={apiErrorMessage(questions.error)}
				onRetry={() => questions.refetch()}
			/>
		);
	}
	if (questions.data.length === 0) {
		return (
			<p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
				Write your first question above, or ask the tutor to make some from your
				notes.
			</p>
		);
	}

	return (
		<ul aria-label="Questions" className="flex flex-col gap-2">
			{questions.data.map((question) => (
				<li key={question.id}>
					<QuestionCard courseId={courseId} question={question} />
				</li>
			))}
		</ul>
	);
}

'use client';

import { CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { LoadError } from '@/components/load-error';
import { Button } from '@/components/ui/button';
import { apiErrorMessage } from '@/lib/api';
import { routes } from '@/lib/routes';
import { useReviewQuestions } from '../hooks';
import { ReviewTopicGroup } from './review-topic-group';

export function ReviewView() {
	const review = useReviewQuestions();

	if (review.isPending) return <ReviewLoading />;
	if (review.isError) {
		return (
			<LoadError
				message={apiErrorMessage(review.error)}
				onRetry={() => review.refetch()}
			/>
		);
	}
	if (review.data.length === 0) return <NothingToReview />;

	return (
		<div className="flex flex-col gap-10">
			{review.data.map((group) => (
				<ReviewTopicGroup key={group.topicId} group={group} />
			))}
		</div>
	);
}

function NothingToReview() {
	return (
		<div className="flex flex-col items-center gap-3 py-16 text-center">
			<span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
				<CheckCheck className="size-6" />
			</span>
			<h2 className="text-lg font-semibold">Nothing to review</h2>
			<p className="max-w-sm text-pretty text-muted-foreground">
				When the tutor writes practice questions from your notes, they wait here
				until you approve them.
			</p>
			<Button asChild variant="outline" className="mt-2 h-9 rounded-full px-4">
				<Link href={routes.courses}>Go to your courses</Link>
			</Button>
		</div>
	);
}

// grey cards in the shape of one topic's questions
function ReviewLoading() {
	return (
		<div
			role="status"
			aria-label="Loading the questions"
			className="flex flex-col gap-3"
		>
			<div className="h-10 w-1/3 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
			{[0, 1].map((card) => (
				<div
					key={card}
					className="h-56 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none"
				/>
			))}
		</div>
	);
}

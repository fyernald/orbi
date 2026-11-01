'use client';

import { usePendingQuestionCount } from '../hooks';

// the line under the page title; it says why the review matters
export function ReviewSummary() {
	const count = usePendingQuestionCount();

	return (
		<p className="text-sm text-pretty text-muted-foreground">
			{count === undefined || count === 0
				? 'Only questions you approve go into your study sessions.'
				: `${count} ${count === 1 ? 'question waits' : 'questions wait'} for your review. Only approved ones go into your study sessions.`}
		</p>
	);
}

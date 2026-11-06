'use client';

import { LoadError } from '@/components/load-error';
import { apiErrorMessage } from '@/lib/api';
import { useToday } from '../hooks';
import { planTotal, questionsLabel, todayState } from '../today';
import { TodayDone } from './today-done';
import { TodayList } from './today-list';

// Today's study list on Home (US-10): the questions due today and the new ones,
// by topic, the weakest first. A student with nothing to study and nothing to
// suggest (no courses yet) sees nothing here.
export function TodayCard() {
	const today = useToday();

	if (today.isPending) {
		return (
			<div
				aria-hidden="true"
				className="h-24 animate-pulse rounded-2xl border border-border bg-card motion-reduce:animate-none"
			/>
		);
	}
	if (today.isError) {
		return (
			<LoadError
				message={apiErrorMessage(today.error)}
				onRetry={() => void today.refetch()}
			/>
		);
	}
	const plan = today.data;
	const state = todayState(plan);
	const nothingToSay =
		plan.upcoming.length + plan.weakTopics.length + plan.emptyTopics.length ===
		0;
	if (state === 'rest' && nothingToSay) return null;

	return (
		<section
			id="today"
			aria-labelledby="today-title"
			className="flex scroll-mt-20 flex-col gap-3"
		>
			<div className="flex items-baseline justify-between gap-3 px-1">
				<h2 id="today-title" className="text-sm font-semibold">
					Today
				</h2>
				{state === 'list' && (
					<p className="text-sm text-muted-foreground tabular-nums">
						{questionsLabel(planTotal(plan))}
					</p>
				)}
			</div>
			{state === 'list' ? (
				<TodayList plan={plan} />
			) : (
				<TodayDone plan={plan} state={state} />
			)}
		</section>
	);
}

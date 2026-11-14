'use client';

import { LoadError } from '@/components/load-error';
import { apiErrorMessage } from '@/lib/api';
import { useToday } from '../hooks';
import { progress, todayState } from '../today';
import { TodayDone } from './today-done';
import { TodayList } from './today-list';
import { WeekAhead } from './week-ahead';

// data-today lets Home put the panel beside the message box on a wide screen
const panel =
	'flex w-full flex-col gap-5 rounded-3xl border border-border bg-card p-5 shadow-xs sm:p-6 xl:w-105 xl:shrink-0 2xl:w-120';

// Today's study list on Home (US-10): the questions due today and the new ones,
// by topic, the weakest first. A student with nothing to study and nothing to
// suggest (no courses yet) sees nothing here.
export function TodayCard() {
	const today = useToday();

	if (today.isPending) {
		return (
			<div
				data-today
				aria-hidden="true"
				className={`${panel} h-96 animate-pulse motion-reduce:animate-none`}
			/>
		);
	}
	if (today.isError) {
		return (
			<div data-today className={panel}>
				<LoadError
					message={apiErrorMessage(today.error)}
					onRetry={() => void today.refetch()}
				/>
			</div>
		);
	}
	const plan = today.data;
	const state = todayState(plan);
	const nothingToSay =
		plan.upcoming.length + plan.weakTopics.length + plan.emptyTopics.length ===
		0;
	if (state === 'rest' && nothingToSay) return null;
	const { done, total } = progress(plan);

	return (
		<section
			data-today
			data-tour="today"
			id="today"
			aria-labelledby="today-title"
			className={`${panel} scroll-mt-20`}
		>
			<div className="flex flex-col gap-3">
				<div className="flex items-baseline justify-between gap-3">
					<h2 id="today-title" className="text-lg font-semibold tracking-tight">
						Today&apos;s review
					</h2>
					{total > 0 && (
						<p className="text-sm text-muted-foreground tabular-nums">
							{done} of {total} done
						</p>
					)}
				</div>
				{total > 0 && (
					<div
						role="progressbar"
						aria-label="Questions done today"
						aria-valuemin={0}
						aria-valuemax={total}
						aria-valuenow={done}
						className="h-2 overflow-hidden rounded-full bg-muted"
					>
						<div
							className="h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
							style={{ width: `${(done / total) * 100}%` }}
						/>
					</div>
				)}
			</div>
			{state === 'list' ? (
				<TodayList plan={plan} />
			) : (
				<TodayDone plan={plan} state={state} />
			)}
			<WeekAhead plan={plan} />
		</section>
	);
}

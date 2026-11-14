import type { TodayPlan } from '@orbi/shared';
import { cn } from '@/lib/utils';
import { questionsLabel, weekAhead } from '../today';

// how many questions come back on each of the next 7 days, as small bars
export function WeekAhead({ plan }: { plan: TodayPlan }) {
	const days = weekAhead(plan);
	const total = days.reduce((sum, { count }) => sum + count, 0);
	if (total === 0) return null;
	const most = Math.max(...days.map(({ count }) => count));

	return (
		<div className="flex flex-col gap-3 border-t border-divider pt-4">
			<div className="flex items-baseline justify-between gap-3">
				<h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
					Next 7 days
				</h3>
				<p className="text-xs text-muted-foreground tabular-nums">
					{questionsLabel(total)}
				</p>
			</div>
			<ol className="grid grid-cols-7 gap-2">
				{days.map(({ date, label, count }, index) => (
					<li key={date} className="flex flex-col items-center gap-1.5">
						<span className="sr-only">
							{label}: {questionsLabel(count)}
						</span>
						<span
							aria-hidden="true"
							className="h-4 text-[11px] text-subtle-foreground tabular-nums"
						>
							{count > 0 ? count : ''}
						</span>
						<span
							aria-hidden="true"
							className="flex h-10 w-full items-end justify-center"
						>
							<span
								className={cn(
									'w-full max-w-6 rounded-t-[5px]',
									count === 0
										? 'h-0.5 bg-border'
										: index === 0
											? 'bg-primary'
											: 'bg-primary/40'
								)}
								style={
									count > 0
										? { height: `${Math.max(20, (count / most) * 100)}%` }
										: undefined
								}
							/>
						</span>
						<span
							aria-hidden="true"
							className="text-[11px] text-muted-foreground"
						>
							{label}
						</span>
					</li>
				))}
			</ol>
		</div>
	);
}

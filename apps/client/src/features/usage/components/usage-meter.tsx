import type { UsageWindow } from '@orbi/shared';
import { OrbitRing } from '@/components/orbit-ring';
import { cn } from '@/lib/utils';
import { usageTextTone } from '../tones';
import { resetLabel } from '../usage';
import { UsageBar } from './usage-bar';

type UsageMeterProps = {
	hour: UsageWindow;
	week: UsageWindow;
	// the collapsed sidebar shows only the ring
	compact: boolean;
};

const resetText = (window: UsageWindow, name: 'hour' | 'week') =>
	window.resetsAt
		? `resets ${resetLabel(window.resetsAt, name)}`
		: 'not started';

// How much AI the student has used: this hour as Orbi's orbit, this week as a bar.
// Only percents, never token numbers.
export function UsageMeter({ hour, week, compact }: UsageMeterProps) {
	const summary = `AI usage: ${hour.percent}% of this hour, ${resetText(hour, 'hour')}. ${week.percent}% of this week, ${resetText(week, 'week')}.`;

	return (
		<div
			role="group"
			aria-label={summary}
			className="flex items-center gap-3 overflow-hidden rounded-xl px-1.5 py-1.5"
		>
			<OrbitRing
				value={Math.min(hour.percent, 100)}
				className={cn('size-9', usageTextTone[hour.state])}
			>
				<span className="text-[10px] font-semibold text-foreground tabular-nums">
					{hour.percent}
				</span>
			</OrbitRing>
			{!compact && (
				<span
					aria-hidden="true"
					className="flex min-w-0 flex-1 flex-col gap-1.5"
				>
					<span className="flex items-baseline justify-between gap-2 text-[13px]">
						<span className="font-medium whitespace-nowrap">This hour</span>
						<span className="truncate text-xs text-muted-foreground">
							{resetText(hour, 'hour')}
						</span>
					</span>
					<UsageBar window={week} />
					<span className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
						<span className="whitespace-nowrap">Week {week.percent}%</span>
						<span className="truncate">{resetText(week, 'week')}</span>
					</span>
				</span>
			)}
		</div>
	);
}

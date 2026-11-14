import type { UsageWindow } from '@orbi/shared';
import { cn } from '@/lib/utils';
import { usageBarTone } from '../tones';

// a thin bar for one window; full at the limit, the extra allowance is not drawn
export function UsageBar({ window }: { window: UsageWindow }) {
	return (
		<span
			aria-hidden="true"
			className="block h-1 w-full overflow-hidden rounded-full bg-border"
		>
			<span
				className={cn(
					'block h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none',
					usageBarTone[window.state]
				)}
				style={{ width: `${Math.min(window.percent, 100)}%` }}
			/>
		</span>
	);
}

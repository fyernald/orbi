import type { CourseColor } from '@orbi/shared';
import { toneTextClasses } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { masteryLabel } from '../today';

// a short bar with the score next to it, in the course's colour
export function MasteryBar({
	mastery,
	color,
}: {
	mastery: number | null;
	color: CourseColor;
}) {
	return (
		<span className="flex w-24 shrink-0 items-center justify-end gap-2">
			<span className="sr-only">{masteryLabel(mastery)}</span>
			{mastery === null ? (
				<span aria-hidden="true" className="text-xs text-muted-foreground">
					Not started
				</span>
			) : (
				<>
					<span
						aria-hidden="true"
						className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
					>
						<span
							className={cn(
								'block h-full rounded-full bg-current',
								toneTextClasses[color]
							)}
							style={{ width: `${Math.max(mastery, 4)}%` }}
						/>
					</span>
					<span
						aria-hidden="true"
						className="w-8 text-right text-xs text-muted-foreground tabular-nums"
					>
						{mastery}%
					</span>
				</>
			)}
		</span>
	);
}

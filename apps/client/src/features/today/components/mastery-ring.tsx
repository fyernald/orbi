import type { CourseColor } from '@orbi/shared';
import { OrbitRing } from '@/components/orbit-ring';
import { toneTextClasses } from '@/lib/tones';
import { cn } from '@/lib/utils';

type MasteryRingProps = {
	mastery: number | null;
	color: CourseColor;
	className?: string;
};

// the topic's mastery as Orbi's orbit, in its course's colour, with the number
// inside; dashed with "New" before the first answer
export function MasteryRing({ mastery, color, className }: MasteryRingProps) {
	return (
		<OrbitRing
			value={mastery}
			className={cn(toneTextClasses[color], 'size-16', className)}
		>
			{mastery === null ? (
				<span className="text-xs font-semibold text-foreground">New</span>
			) : (
				<span className="text-lg font-semibold tracking-tight text-foreground tabular-nums">
					{mastery}
					<span className="text-xs text-muted-foreground">%</span>
				</span>
			)}
		</OrbitRing>
	);
}

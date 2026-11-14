import type { CourseColor } from '@orbi/shared';
import { OrbitRing } from '@/components/orbit-ring';
import { cn } from '@/lib/utils';

// full class names, so Tailwind finds them
const ringTones: Record<CourseColor, string> = {
	blue: 'text-tone-blue-foreground',
	teal: 'text-tone-teal-foreground',
	green: 'text-tone-green-foreground',
	amber: 'text-tone-amber-foreground',
	red: 'text-tone-red-foreground',
};

type MasteryRingProps = {
	// 0 to 100, or null while there is no score yet
	value: number | null;
	color: CourseColor;
	// read out instead of the ring, which screen readers skip
	label?: string;
	// the % in the middle; a small ring leaves it to the text beside it
	showValue?: boolean;
	className?: string;
};

// how much of a course is known, as a moon on its orbit
export function MasteryRing({
	value,
	color,
	label,
	showValue = true,
	className,
}: MasteryRingProps) {
	const ring = (
		<OrbitRing
			value={value}
			className={cn('size-11', ringTones[color], className)}
		>
			{showValue && value !== null && (
				<span className="text-[11px] font-semibold text-foreground tabular-nums">
					{value}%
				</span>
			)}
		</OrbitRing>
	);
	if (!label) return ring;
	return (
		<>
			{ring}
			<span className="sr-only">{label}</span>
		</>
	);
}

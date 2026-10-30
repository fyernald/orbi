import type { CourseColor } from '@orbi/shared';
import { cn } from '@/lib/utils';
import { orbitPoint } from '../orbit';

// full class names, so Tailwind finds them
const ringTones: Record<CourseColor, string> = {
	blue: 'text-tone-blue-foreground',
	teal: 'text-tone-teal-foreground',
	green: 'text-tone-green-foreground',
	amber: 'text-tone-amber-foreground',
	red: 'text-tone-red-foreground',
};

const CENTER = 22;
const RADIUS = 19;

type MasteryRingProps = {
	// 0 to 100, or null while there is no score yet
	value: number | null;
	color: CourseColor;
	className?: string;
};

// how much of a course is known, as a moon on its orbit;
// without a score the ring is dashed and the moon waits at the top
export function MasteryRing({ value, color, className }: MasteryRingProps) {
	const moon = orbitPoint(value ?? 0, RADIUS, CENTER);

	return (
		<span
			aria-hidden="true"
			className={cn('relative size-11 shrink-0', ringTones[color], className)}
		>
			<svg viewBox="0 0 44 44" className="size-full">
				<circle
					cx={CENTER}
					cy={CENTER}
					r={RADIUS}
					fill="none"
					strokeWidth={2}
					strokeDasharray={value === null ? '3 3' : undefined}
					className="stroke-border"
				/>
				{value !== null && (
					<circle
						cx={CENTER}
						cy={CENTER}
						r={RADIUS}
						fill="none"
						strokeWidth={2}
						strokeLinecap="round"
						pathLength={100}
						strokeDasharray={`${value} 100`}
						transform={`rotate(-90 ${CENTER} ${CENTER})`}
						className="stroke-current"
					/>
				)}
				<circle cx={moon.x} cy={moon.y} r={3.5} className="fill-current" />
			</svg>
			{value !== null && (
				<span className="absolute inset-0 grid place-items-center text-[11px] font-semibold text-foreground tabular-nums">
					{value}%
				</span>
			)}
		</span>
	);
}

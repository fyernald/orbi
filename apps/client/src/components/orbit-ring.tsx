import type { ReactNode } from 'react';
import { orbitPoint } from '@/lib/orbit';
import { cn } from '@/lib/utils';

const CENTER = 22;
const RADIUS = 19;
const MOON_START = orbitPoint(0, RADIUS, CENTER);

type OrbitRingProps = {
	// 0 to 100, or null while there is nothing to show yet
	value: number | null;
	className?: string;
	// shown in the middle of the ring
	children?: ReactNode;
};

// Orbi's orbit as a progress ring: the arc fills clockwise from the top and the moon
// rides at its end. Without a value the ring is dashed and the moon waits at the top.
// The arc and the moon take the text colour.
export function OrbitRing({ value, className, children }: OrbitRingProps) {
	const percent = value ?? 0;

	return (
		<span aria-hidden="true" className={cn('relative shrink-0', className)}>
			<svg viewBox="0 0 44 44" className="size-full overflow-visible">
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
						strokeDasharray={`${percent} 100`}
						transform={`rotate(-90 ${CENTER} ${CENTER})`}
						className="stroke-current transition-[stroke-dasharray] duration-500 ease-out motion-reduce:transition-none"
					/>
				)}
				{/* turned instead of moved, so the moon follows the orbit when it changes */}
				<circle
					cx={MOON_START.x}
					cy={MOON_START.y}
					r={3.5}
					style={{
						transform: `rotate(${percent * 3.6}deg)`,
						transformOrigin: `${CENTER}px ${CENTER}px`,
					}}
					className="fill-current transition-transform duration-500 ease-out motion-reduce:transition-none"
				/>
			</svg>
			{children && (
				<span className="absolute inset-0 grid place-items-center">
					{children}
				</span>
			)}
		</span>
	);
}

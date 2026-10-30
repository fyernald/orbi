import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

export type SparkleShape = 'dot' | 'star';

type SparkleProps = {
	// which way it flies from the middle, in degrees
	angle: number;
	distance: number;
	size: number;
	delay: number;
	shape: SparkleShape;
	className: string;
};

// one piece of the burst: starts in the middle and flies out along its angle
export function Sparkle({
	angle,
	distance,
	size,
	delay,
	shape,
	className,
}: SparkleProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			style={
				{
					width: size,
					height: size,
					marginTop: -size / 2,
					marginLeft: -size / 2,
					'--angle': `${angle}deg`,
					'--distance': `${distance}px`,
					'--delay': `${delay}ms`,
				} as CSSProperties
			}
			className={cn('burst absolute top-1/2 left-1/2', className)}
		>
			{shape === 'dot' ? (
				<circle cx="12" cy="12" r="12" fill="currentColor" />
			) : (
				<path
					d="M12 0C12 6.6 17.4 12 24 12 17.4 12 12 17.4 12 24 12 17.4 6.6 12 0 12 6.6 12 12 6.6 12 0Z"
					fill="currentColor"
				/>
			)}
		</svg>
	);
}

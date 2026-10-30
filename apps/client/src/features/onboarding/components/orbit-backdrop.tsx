import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { OrbitMoon } from './orbit-moon';

// how far the orbit tips back, as if seen from a little above
const TILT = '74deg';
// the moon goes this far round by the last question; finishing closes the circle
const TRAVEL_DEGREES = 300;

type OrbitBackdropProps = {
	// share of the questions answered, 0 to 1
	progress: number;
	finished: boolean;
};

// a wide orbit behind the questions: the berry moon moves on with every answer
// and the small one drifts the other way, so each step feels like part of one journey
export function OrbitBackdrop({ progress, finished }: OrbitBackdropProps) {
	const angle = finished ? 360 : progress * TRAVEL_DEGREES;

	return (
		<div
			style={{ '--orbit-tilt': TILT } as CSSProperties}
			className="absolute top-[34vh] left-1/2 aspect-square w-[min(1200px,170vw)] -translate-x-1/2 -translate-y-1/2 perspective-[1600px]"
		>
			<div className="absolute inset-0 transform-3d [transform:rotateX(var(--orbit-tilt))]">
				<span
					className={cn(
						'absolute inset-0 rounded-full border-[1.5px] transition-[border-color,box-shadow] duration-1000',
						finished
							? 'border-primary/50 shadow-[0_0_28px_-12px_var(--primary)]'
							: 'border-foreground/15'
					)}
				/>
				<span className="absolute inset-[14%] rounded-full border border-dashed border-foreground/10" />
				<OrbitMoon
					angle={angle}
					className="size-4 bg-primary shadow-[0_0_18px_4px_var(--primary)]"
				/>
				<OrbitMoon
					angle={-angle * 0.6}
					inset="14%"
					className="size-2.5 bg-foreground/50"
				/>
			</div>
		</div>
	);
}

import { cn } from '@/lib/utils';

type OrbitMoonProps = {
	angle: number;
	inset?: string;
	className: string;
};

// turns with its ring, then turns back and stands up against the tilt, so it stays round
export function OrbitMoon({ angle, inset = '0%', className }: OrbitMoonProps) {
	const turn =
		'transition-transform duration-[1600ms] ease-(--ease-out-quint) motion-reduce:transition-none';

	return (
		<div
			style={{ inset, transform: `rotate(${angle}deg)` }}
			className={cn('absolute transform-3d', turn)}
		>
			<span
				style={{
					transform: `translate(-50%, -50%) rotate(${-angle}deg) rotateX(calc(var(--orbit-tilt) * -1))`,
				}}
				className={cn('absolute top-0 left-1/2 rounded-full', turn, className)}
			/>
		</div>
	);
}

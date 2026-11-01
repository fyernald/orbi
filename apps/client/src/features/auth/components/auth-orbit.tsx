import type { CSSProperties } from 'react';
import { OrbiMark } from '@/components/brand/orbi-mark';
import { toneClasses, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

// how far the orbit tips back, as if seen from a little above
const TILT = '66deg';

type Ring = {
	// the ring's distance from the edge of the orbit, so the inner rings are smaller
	inset: string;
	// seconds per turn; inner rings move faster, like real orbits
	seconds: number;
	dashed?: boolean;
	moons: { label: string; tone: Tone; angle: number }[];
};

// sample courses, like the ones on the courses page
const rings: Ring[] = [
	{
		inset: '24%',
		seconds: 45,
		moons: [{ label: 'BIO', tone: 'green', angle: 20 }],
	},
	{
		inset: '12%',
		seconds: 75,
		moons: [
			{ label: 'CHEM', tone: 'blue', angle: 150 },
			{ label: 'PHY', tone: 'red', angle: 290 },
		],
	},
	{
		inset: '0%',
		seconds: 110,
		dashed: true,
		moons: [
			{ label: 'HIST', tone: 'amber', angle: 230 },
			{ label: 'MATH', tone: 'teal', angle: 70 },
		],
	},
];

// where a moon sits on its ring, as a share of the ring's width and height
const onRing = (angle: number) => {
	const radians = (angle * Math.PI) / 180;
	return {
		left: `${50 + 50 * Math.cos(radians)}%`,
		top: `${50 + 50 * Math.sin(radians)}%`,
	};
};

// Orbi in the middle and courses going round it, like the courses page. Each moon
// turns back against its ring and stands up against the tilt, so it keeps facing
// the viewer. It stays still with reduced motion.
export function AuthOrbit({ className }: { className?: string }) {
	return (
		<div
			aria-hidden="true"
			style={{ '--orbit-tilt': TILT } as CSSProperties}
			className={cn('aspect-square perspective-[60rem]', className)}
		>
			{/* the glow and Orbi stay out of the tilted plane, where their soft edges would be cut off */}
			<span className="absolute inset-[22%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--primary)_30%,transparent),transparent)]" />
			<OrbiMark className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_32px_var(--primary)]" />
			<div className="absolute inset-0 transform-3d [transform:rotateX(var(--orbit-tilt))]">
				{rings.map((ring) => (
					<div
						key={ring.inset}
						style={{ inset: ring.inset }}
						className="absolute transform-3d"
					>
						<span
							className={cn(
								'absolute inset-0 rounded-full border border-foreground/20',
								ring.dashed && 'border-dashed border-foreground/15'
							)}
						/>
						<div
							style={
								{ '--orbit-duration': `${ring.seconds}s` } as CSSProperties
							}
							className="absolute inset-0 transform-3d animate-[orbit_var(--orbit-duration)_linear_infinite] motion-reduce:animate-none"
						>
							{ring.moons.map((moon) => (
								<span
									key={moon.label}
									style={onRing(moon.angle)}
									className="absolute size-0 transform-3d animate-[orbit_var(--orbit-duration)_linear_infinite_reverse] motion-reduce:animate-none"
								>
									<span
										className={cn(
											'absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[10px] font-semibold tracking-wide ring-4 ring-background [transform:rotateX(calc(var(--orbit-tilt)*-1))]',
											toneClasses[moon.tone]
										)}
									>
										{moon.label}
									</span>
								</span>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

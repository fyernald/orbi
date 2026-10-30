import type { CSSProperties } from 'react';
import { OrbiMark } from '@/components/brand/orbi-mark';
import { Sparkle, type SparkleShape } from './sparkle';

// brand colours only: berry, its light shade, and the gold of the streak flame
const tones = [
	'text-primary',
	'text-accent-foreground',
	'text-warning',
	'text-primary',
];

// spread evenly round the circle with a little wobble, so it looks free but plays the same every time
const sparkles = Array.from({ length: 18 }, (_, index) => ({
	angle: index * 20 + (index % 3) * 7,
	distance: 110 + ((index * 37) % 80),
	size: index % 3 === 0 ? 18 : 6 + (index % 2) * 3,
	delay: 240 + (index % 4) * 50,
	shape: (index % 3 === 0 ? 'star' : 'dot') as SparkleShape,
	className: tones[index % tones.length]!,
}));

const rippleDelays = [0, 350, 700];

// the Orbi mark lands, rings spread out from it, sparkles fly off, and a check draws itself
export function SuccessBurst() {
	return (
		<div aria-hidden="true" className="relative size-52">
			{rippleDelays.map((delay) => (
				<span
					key={delay}
					style={{ '--delay': `${delay}ms` } as CSSProperties}
					className="ripple absolute inset-10 rounded-full border-2 border-primary"
				/>
			))}
			<span className="celebrate-in absolute inset-6 rounded-full border border-dashed border-primary/30" />
			<span className="absolute inset-6 animate-[orbit_6s_linear_infinite] motion-reduce:animate-none">
				<span className="absolute -top-1 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-warning shadow-[0_0_10px_var(--warning)]" />
			</span>
			{sparkles.map((sparkle, index) => (
				<Sparkle key={index} {...sparkle} />
			))}
			<span className="celebrate-in absolute inset-0 flex items-center justify-center">
				<span className="relative">
					<OrbiMark className="size-20 drop-shadow-[0_0_28px_var(--primary)]" />
					<span
						style={{ animationDelay: '420ms' }}
						className="celebrate-in absolute -right-1.5 -bottom-1.5 flex size-8 items-center justify-center rounded-full bg-primary ring-4 ring-background"
					>
						<svg viewBox="0 0 24 24" className="size-4 text-primary-foreground">
							<path
								d="M5 12.5l4.5 4.5L19 7.5"
								fill="none"
								stroke="currentColor"
								strokeWidth="3"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="draw-check"
							/>
						</svg>
					</span>
				</span>
			</span>
		</div>
	);
}

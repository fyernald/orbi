import { OrbiMark } from '@/components/brand/orbi-mark';

// the Orbi mark with a moon going round it; it stays still with reduced motion
export function OrbitHero() {
	return (
		<div aria-hidden="true" className="relative size-36">
			<span className="absolute inset-0 rounded-full border border-dashed border-border" />
			<span className="absolute inset-5 rounded-full border border-border/70" />
			<span className="absolute inset-0 animate-[orbit_14s_linear_infinite] motion-reduce:animate-none">
				<span className="absolute top-1/2 -left-1.5 size-3 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_14px_var(--primary)]" />
			</span>
			<span className="absolute inset-5 animate-[orbit_9s_linear_infinite_reverse] motion-reduce:animate-none">
				<span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-foreground/60" />
			</span>
			<span className="absolute inset-0 flex items-center justify-center">
				<OrbiMark className="size-14 drop-shadow-[0_0_24px_var(--primary)]" />
			</span>
		</div>
	);
}

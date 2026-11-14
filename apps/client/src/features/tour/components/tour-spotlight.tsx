import { cn } from '@/lib/utils';
import { spotlightBox, type Box } from '../placement';

// Dims the page around the part a step points at, with a ring round it; with
// no part, the whole page is dimmed. The card is the only thing to use.
export function TourSpotlight({ target }: { target: Box | null }) {
	if (!target) {
		return (
			<div
				aria-hidden="true"
				className="fixed inset-0 z-50 bg-black/55 motion-safe:animate-in motion-safe:fade-in-0"
			/>
		);
	}

	const { top, left, width, height } = spotlightBox(target);
	return (
		<div
			aria-hidden="true"
			style={{ top, left, width, height }}
			className={cn(
				'pointer-events-none fixed z-50 rounded-2xl ring-2 ring-primary',
				// the shadow is the dim layer, with a hole where the part is
				'shadow-[0_0_0_9999px_rgb(0_0_0/0.55)]',
				'motion-safe:transition-[top,left,width,height] motion-safe:duration-300 motion-safe:ease-out'
			)}
		/>
	);
}

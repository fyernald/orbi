'use client';

import { Dialog as DialogPrimitive } from 'radix-ui';
import {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type KeyboardEvent,
} from 'react';
import { cn } from '@/lib/utils';
import { placeCard, type Size } from '../placement';
import { tourProgress, type TourStep } from '../steps';
import { useTourLayout } from '../use-tour-layout';
import { TourCard } from './tour-card';
import { TourSpotlight } from './tour-spotlight';

type TourDialogProps = {
	step: TourStep;
	index: number;
	total: number;
	onNext: () => void;
	onBack: () => void;
	// Skip, the close button and Esc
	onEnd: () => void;
};

// the card's size before it is measured
const FIRST_CARD_SIZE: Size = { width: 320, height: 176 };

// A dialog the keyboard and screen readers can use: the focus stays in the card,
// Esc ends the tour, and ← → move between steps. The card sits next to the part
// it talks about, and the rest of the page is dimmed.
export function TourDialog({
	step,
	index,
	total,
	onNext,
	onBack,
	onEnd,
}: TourDialogProps) {
	const { target, viewport } = useTourLayout(step.targets);
	const [card, setCard] = useState<HTMLDivElement | null>(null);
	const [cardSize, setCardSize] = useState(FIRST_CARD_SIZE);
	const next = useRef<HTMLButtonElement>(null);
	// The dialog reads out the first step as it opens; later steps are read out
	// here, and the focus goes back to Next, even from a Back that turned off
	const [moved, setMoved] = useState(false);
	const move = (to: () => void) => () => {
		setMoved(true);
		to();
	};

	useLayoutEffect(() => {
		if (!card) return;
		const measure = () =>
			setCardSize({ width: card.offsetWidth, height: card.offsetHeight });
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(card);
		return () => observer.disconnect();
	}, [card]);

	useEffect(() => {
		if (moved) next.current?.focus();
	}, [index, moved]);

	const goNext = move(onNext);
	const goBack = move(onBack);
	const moveWithArrows = (event: KeyboardEvent) => {
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			goNext();
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			goBack();
		}
	};

	const placement = placeCard(target, cardSize, viewport);

	return (
		<DialogPrimitive.Root
			open
			onOpenChange={(open) => {
				if (!open) onEnd();
			}}
		>
			<DialogPrimitive.Portal>
				<TourSpotlight target={target} />
				<DialogPrimitive.Content
					ref={setCard}
					onOpenAutoFocus={(event) => {
						event.preventDefault();
						next.current?.focus();
					}}
					// a click on the dimmed page does not end the tour by mistake
					onInteractOutside={(event) => event.preventDefault()}
					onKeyDown={moveWithArrows}
					style={{
						top: placement.top,
						left: placement.left,
						// hidden for the one frame before the page is measured
						visibility: viewport.width > 0 ? 'visible' : 'hidden',
					}}
					className={cn(
						'fixed z-50 flex w-80 flex-col gap-2 rounded-2xl bg-popover p-4 text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none',
						'motion-safe:transition-[top,left] motion-safe:duration-300 motion-safe:ease-out',
						placement.side === 'docked' && 'w-[calc(100vw-2rem)]'
					)}
				>
					<TourCard
						step={step}
						index={index}
						total={total}
						onNext={goNext}
						onBack={goBack}
						onSkip={onEnd}
						nextRef={next}
					/>
					<p aria-live="polite" className="sr-only">
						{moved &&
							`${tourProgress(index, total)}. ${step.title}. ${step.body}`}
					</p>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}

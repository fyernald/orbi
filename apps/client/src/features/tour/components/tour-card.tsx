import { X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import type { Ref } from 'react';
import { Button } from '@/components/ui/button';
import { tourProgress, type TourStep } from '../steps';

type TourCardProps = {
	step: TourStep;
	index: number;
	total: number;
	onNext: () => void;
	onBack: () => void;
	onSkip: () => void;
	nextRef: Ref<HTMLButtonElement>;
};

// one step: what this part is for, where the student is in the tour, and the
// buttons to move on, go back or stop
export function TourCard({
	step,
	index,
	total,
	onNext,
	onBack,
	onSkip,
	nextRef,
}: TourCardProps) {
	const last = index === total - 1;

	return (
		<>
			<div className="flex items-start justify-between gap-3">
				<DialogPrimitive.Title className="pt-1 text-base font-semibold tracking-tight">
					{step.title}
				</DialogPrimitive.Title>
				<DialogPrimitive.Close asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Close the tour"
						className="-mr-1.5 shrink-0 rounded-lg text-muted-foreground"
					>
						<X />
					</Button>
				</DialogPrimitive.Close>
			</div>
			<DialogPrimitive.Description className="text-sm leading-relaxed text-muted-foreground">
				{step.body}
			</DialogPrimitive.Description>
			<div className="flex items-center gap-2 pt-1">
				<span className="text-xs text-muted-foreground tabular-nums">
					{tourProgress(index, total)}
				</span>
				<div className="ml-auto flex items-center gap-1.5">
					<Button
						variant="ghost"
						size="sm"
						onClick={onSkip}
						className="rounded-lg text-muted-foreground"
					>
						Skip
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={onBack}
						disabled={index === 0}
						className="rounded-lg"
					>
						Back
					</Button>
					<Button
						ref={nextRef}
						size="sm"
						onClick={onNext}
						className="rounded-lg"
					>
						{last ? 'Done' : 'Next'}
					</Button>
				</div>
			</div>
		</>
	);
}

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type OnboardingProgressProps = {
	// the question on screen, counted from 1
	current: number;
	total: number;
	onBack: () => void;
};

// a thin track with a glowing moon at its end, like the dot on the mastery rings
export function OnboardingProgress({
	current,
	total,
	onBack,
}: OnboardingProgressProps) {
	const percent = (current / total) * 100;

	return (
		<div className="flex h-9 items-center gap-3">
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={onBack}
				aria-label="Previous question"
				className="size-9 rounded-full text-muted-foreground"
			>
				<ArrowLeft className="size-4.5" />
			</Button>
			<div
				role="progressbar"
				aria-label="Questions answered"
				aria-valuemin={1}
				aria-valuemax={total}
				aria-valuenow={current}
				className="relative h-1.5 flex-1 rounded-full bg-foreground/10"
			>
				<div
					className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-700 ease-(--ease-out-quint) motion-reduce:transition-none"
					style={{ width: `${percent}%` }}
				>
					<span className="absolute top-1/2 right-0 size-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)] ring-4 ring-primary/20" />
				</div>
			</div>
			<span className="w-10 text-right text-sm text-muted-foreground tabular-nums">
				{current}/{total}
			</span>
		</div>
	);
}

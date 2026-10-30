import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PageControlsProps = {
	// the page in view, from 0
	page: number;
	count: number;
	onGo: (page: number) => void;
};

// a wheel mouse cannot scroll sideways, so the pages also turn with these buttons
export function PageControls({ page, count, onGo }: PageControlsProps) {
	return (
		<div className="flex items-center justify-end gap-1">
			<span
				aria-live="polite"
				className="mr-1.5 text-sm text-muted-foreground tabular-nums"
			>
				{page + 1} / {count}
			</span>
			<Button
				variant="outline"
				size="icon"
				aria-label="Previous courses"
				disabled={page === 0}
				onClick={() => onGo(page - 1)}
				className="rounded-full"
			>
				<ChevronLeft />
			</Button>
			<Button
				variant="outline"
				size="icon"
				aria-label="Next courses"
				disabled={page === count - 1}
				onClick={() => onGo(page + 1)}
				className="rounded-full"
			>
				<ChevronRight />
			</Button>
		</div>
	);
}

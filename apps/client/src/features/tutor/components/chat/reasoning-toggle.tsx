import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// the line that opens and closes Orbi's thinking
export function ReasoningToggle({
	label,
	thinking,
	open,
	controls,
	onToggle,
}: {
	label: string;
	// still thinking: the label shimmers
	thinking: boolean;
	open: boolean;
	controls: string;
	onToggle: () => void;
}) {
	return (
		<button
			type="button"
			aria-expanded={open}
			aria-controls={controls}
			onClick={onToggle}
			className="flex w-fit items-center gap-1 rounded-md py-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
		>
			<span className={cn(thinking && 'shimmer-text font-medium')}>
				{label}
			</span>
			<ChevronRight
				aria-hidden="true"
				className={cn(
					'size-3.5 transition-transform duration-200 motion-reduce:transition-none',
					open && 'rotate-90'
				)}
			/>
		</button>
	);
}

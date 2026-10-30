import { Check } from 'lucide-react';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

type SuggestionPillProps = {
	label: string;
	selected: boolean;
	disabled?: boolean;
	// its place in the list, so the pills come in one after another
	order: number;
	onClick: () => void;
};

// a ready answer the student can tap instead of typing
export function SuggestionPill({
	label,
	selected,
	disabled = false,
	order,
	onClick,
}: SuggestionPillProps) {
	return (
		<button
			type="button"
			aria-pressed={selected}
			disabled={disabled}
			onClick={onClick}
			style={{ '--stagger': order } as CSSProperties}
			className={cn(
				'stagger-in inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,color,scale] duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 disabled:pointer-events-none disabled:opacity-45',
				selected
					? 'border-primary bg-primary text-primary-foreground'
					: 'border-border bg-card/70 backdrop-blur-sm hover:border-primary/40 hover:bg-card'
			)}
		>
			{selected && <Check aria-hidden="true" className="pop-in size-4" />}
			{label}
		</button>
	);
}

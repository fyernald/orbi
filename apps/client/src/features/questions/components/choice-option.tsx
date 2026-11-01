import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { choiceLetter, type ChoiceMark } from '../choices';

type ChoiceOptionProps = {
	index: number;
	text: string;
	mark?: ChoiceMark;
	// picked, while the answer is being checked
	selected?: boolean;
	disabled: boolean;
	onPick: () => void;
	className?: string;
};

// one answer of a multiple-choice question, as a button
export function ChoiceOption({
	index,
	text,
	mark,
	selected = false,
	disabled,
	onPick,
	className,
}: ChoiceOptionProps) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onPick}
			className={cn(
				'flex w-full items-baseline gap-2.5 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm transition-colors enabled:hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-default',
				selected && !mark && 'border-primary',
				mark === 'right' &&
					'border-tone-green-foreground/40 bg-tone-green text-tone-green-foreground',
				mark === 'wrong' &&
					'border-tone-red-foreground/40 bg-tone-red text-tone-red-foreground',
				className
			)}
		>
			<span className="text-xs font-medium text-muted-foreground">
				{choiceLetter(index)}
			</span>
			<span className="min-w-0 flex-1 break-words">{text}</span>
			{mark === 'right' && (
				<>
					<Check className="size-4 shrink-0 self-center" />
					<span className="sr-only">(correct answer)</span>
				</>
			)}
			{mark === 'wrong' && (
				<>
					<X className="size-4 shrink-0 self-center" />
					<span className="sr-only">(your answer)</span>
				</>
			)}
		</button>
	);
}

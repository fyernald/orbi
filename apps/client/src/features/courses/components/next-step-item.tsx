import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type NextStepItemProps = {
	number: number;
	done: boolean;
	title: string;
	text: string;
	// the feature is planned but not in the app yet
	soon?: boolean;
};

export function NextStepItem({
	number,
	done,
	title,
	text,
	soon = false,
}: NextStepItemProps) {
	return (
		<li className="flex items-start gap-3">
			<span
				className={cn(
					'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums',
					done
						? 'border-transparent bg-primary text-primary-foreground'
						: 'border-border text-muted-foreground'
				)}
			>
				{done ? <Check className="size-3.5" strokeWidth={2.5} /> : number}
			</span>
			<div className="flex min-w-0 flex-col gap-0.5">
				<p
					className={cn(
						'flex items-center gap-2 text-sm font-medium',
						done && 'text-muted-foreground line-through'
					)}
				>
					{title}
					{soon && !done && (
						<span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground no-underline">
							Soon
						</span>
					)}
				</p>
				<p className="text-xs text-muted-foreground">{text}</p>
			</div>
		</li>
	);
}

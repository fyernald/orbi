import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Suggestion, SuggestionTone } from '../suggestions';

const dotColor: Record<SuggestionTone, string> = {
	primary: 'bg-primary',
	warning: 'bg-warning',
};

export function SuggestionChip({ suggestion }: { suggestion: Suggestion }) {
	const isPrimary = suggestion.tone === 'primary';

	return (
		<Link
			href={suggestion.href}
			className={cn(
				'inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
				isPrimary
					? 'border-accent bg-accent text-accent-foreground hover:bg-primary/15'
					: 'border-border bg-card text-subtle-foreground hover:bg-muted'
			)}
		>
			<span
				aria-hidden="true"
				className={cn('size-1.5 rounded-full', dotColor[suggestion.tone])}
			/>
			{suggestion.label}
		</Link>
	);
}

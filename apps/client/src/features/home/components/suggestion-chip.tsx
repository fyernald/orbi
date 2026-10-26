import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Suggestion, SuggestionTone } from '../mock-data';

const dotColor: Record<SuggestionTone, string> = {
	primary: 'bg-primary',
	amber: 'bg-[#f5b83d]',
	neutral: 'bg-[#8792a8]',
};

export function SuggestionChip({ suggestion }: { suggestion: Suggestion }) {
	const isPrimary = suggestion.tone === 'primary';

	return (
		<Link
			href={suggestion.href}
			className={cn(
				'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors',
				isPrimary
					? 'border-accent bg-accent text-accent-foreground hover:bg-[#e1e7fd]'
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

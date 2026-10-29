import type { ReactNode } from 'react';

export function KeyHint({ children }: { children: ReactNode }) {
	return (
		<kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border bg-background px-1.5 font-sans text-[11px] font-medium text-muted-foreground">
			{children}
		</kbd>
	);
}

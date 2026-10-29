import type { ReactNode } from 'react';

type StepCardProps = {
	heading: string;
	description: string;
	footer: ReactNode;
	children: ReactNode;
};

export function StepCard({
	heading,
	description,
	footer,
	children,
}: StepCardProps) {
	return (
		<div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
			<div className="flex flex-col gap-1 border-b border-divider px-5 py-5 sm:px-7">
				<h2 className="text-lg font-medium tracking-tight">{heading}</h2>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
			<div className="flex flex-col gap-6 px-5 py-6 sm:px-7">{children}</div>
			<div className="mt-auto flex items-center justify-between gap-3 border-t border-divider bg-muted/50 px-5 py-4 sm:px-7">
				{footer}
			</div>
		</div>
	);
}

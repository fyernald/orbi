import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type VisualCardProps = {
	title: string;
	// what sort of visual it is, under the title
	label: string;
	icon: LucideIcon;
	// for screen readers: what the visual shows
	description: string;
	toolbar: ReactNode;
	children: ReactNode;
};

// The frame every visual in the chat shares: a title, the actions on the right,
// and the visual under them.
export function VisualCard({
	title,
	label,
	icon: Icon,
	description,
	toolbar,
	children,
}: VisualCardProps) {
	return (
		<figure className="overflow-hidden rounded-2xl border border-border bg-card">
			<header className="flex items-center gap-2.5 border-b border-divider py-2 pr-2 pl-4">
				<Icon aria-hidden className="size-4 shrink-0 text-primary" />
				<div className="min-w-0 flex-1">
					<h4 className="truncate text-sm font-semibold">{title}</h4>
					<p className="text-xs text-muted-foreground">{label}</p>
				</div>
				<div className="flex shrink-0 items-center gap-0.5">{toolbar}</div>
			</header>
			<div className="p-4">{children}</div>
			<figcaption className="sr-only">{description}</figcaption>
		</figure>
	);
}

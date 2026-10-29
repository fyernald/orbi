import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

type PageHeaderProps = {
	backHref: string;
	backLabel: string;
	title: ReactNode;
	subtitle?: ReactNode;
	// shown before the title, for example the course badge
	leading?: ReactNode;
};

export function PageHeader({
	backHref,
	backLabel,
	title,
	subtitle,
	leading,
}: PageHeaderProps) {
	return (
		<header className="flex items-start gap-4">
			<Link
				href={backHref}
				aria-label={backLabel}
				className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
			>
				<ArrowLeft className="size-4" />
			</Link>
			{leading}
			<div className="flex min-w-0 flex-col gap-0.5">
				<h1 className="truncate text-2xl font-medium tracking-tight">
					{title}
				</h1>
				{subtitle && (
					<p className="text-sm text-muted-foreground">{subtitle}</p>
				)}
			</div>
		</header>
	);
}

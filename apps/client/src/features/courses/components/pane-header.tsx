import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PaneHeaderProps = {
	title: ReactNode;
	// buttons before the title, for example to hide a side pane
	leading?: ReactNode;
	actions?: ReactNode;
	className?: string;
};

export function PaneHeader({
	title,
	leading,
	actions,
	className,
}: PaneHeaderProps) {
	return (
		<div
			className={cn(
				'flex h-12 shrink-0 items-center gap-2 border-b border-divider px-4',
				className
			)}
		>
			{leading}
			<div className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium">
				{title}
			</div>
			{actions}
		</div>
	);
}

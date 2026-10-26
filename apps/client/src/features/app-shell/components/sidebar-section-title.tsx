import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SidebarSectionTitleProps = {
	id: string;
	collapsed: boolean;
	className?: string;
	action?: ReactNode;
	children: ReactNode;
};

// kept in the DOM because the section uses it as its label
export function SidebarSectionTitle({
	id,
	collapsed,
	className,
	action,
	children,
}: SidebarSectionTitleProps) {
	return (
		<div
			className={cn(
				'flex items-center justify-between overflow-hidden px-2.5 transition-[height,opacity] duration-300 motion-reduce:transition-none',
				collapsed ? 'invisible h-0 opacity-0' : 'h-8 opacity-100',
				className
			)}
		>
			<h2 id={id} className="text-[13px] font-medium whitespace-nowrap">
				{children}
			</h2>
			{action}
		</div>
	);
}

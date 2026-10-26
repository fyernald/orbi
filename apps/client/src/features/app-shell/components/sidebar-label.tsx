import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SidebarLabelProps = {
	hidden: boolean;
	className?: string;
	children: ReactNode;
};

// kept in the DOM so screen readers still read it when collapsed
export function SidebarLabel({
	hidden,
	className,
	children,
}: SidebarLabelProps) {
	return (
		<span
			className={cn(
				'whitespace-nowrap transition-opacity duration-200 motion-reduce:transition-none',
				hidden ? 'opacity-0' : 'opacity-100 delay-100',
				className
			)}
		>
			{children}
		</span>
	);
}

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// A short slide and fade in when it appears, for moving from one item to the next
// (give it the item's key). Nothing moves when reduced motion is on.
export function SlideIn({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				'animate-in duration-300 ease-out fade-in-0 slide-in-from-right-6 motion-reduce:animate-none',
				className
			)}
		>
			{children}
		</div>
	);
}

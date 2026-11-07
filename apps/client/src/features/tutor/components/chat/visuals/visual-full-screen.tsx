'use client';

import type { ReactNode } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

type VisualFullScreenProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	children: ReactNode;
};

// a visual as large as the screen allows, for a big diagram on a phone
export function VisualFullScreen({
	open,
	onOpenChange,
	title,
	description,
	children,
}: VisualFullScreenProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[90dvh] w-[95vw] flex-col gap-3 sm:max-w-[min(1200px,95vw)]">
				<DialogHeader className="pr-8">
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<div className="min-h-0 flex-1 overflow-auto rounded-xl bg-card p-4">
					{children}
				</div>
			</DialogContent>
		</Dialog>
	);
}

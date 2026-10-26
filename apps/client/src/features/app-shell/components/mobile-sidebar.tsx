'use client';

import type { MouseEvent } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';

type MobileSidebarProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
	const closeOnLink = (event: MouseEvent) => {
		if ((event.target as HTMLElement).closest('a')) onOpenChange(false);
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="left"
				showCloseButton={false}
				aria-describedby={undefined}
				className="w-72 max-w-[85vw] gap-0 border-r-0 bg-sidebar p-0 shadow-none data-[side=left]:sm:max-w-72"
			>
				<SheetTitle className="sr-only">Menu</SheetTitle>
				<div className="h-full" onClickCapture={closeOnLink}>
					<Sidebar
						collapsed={false}
						onToggle={() => onOpenChange(false)}
						variant="drawer"
					/>
				</div>
			</SheetContent>
		</Sheet>
	);
}

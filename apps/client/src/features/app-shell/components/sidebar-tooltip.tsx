'use client';

import { useState, type ReactElement } from 'react';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';

type SidebarTooltipProps = {
	label: string;
	// same tree in both states, so focus is not lost on toggle
	show: boolean;
	children: ReactElement;
};

export function SidebarTooltip({ label, show, children }: SidebarTooltipProps) {
	// always controlled; Radix warns when a tooltip switches between the two
	const [open, setOpen] = useState(false);
	const [shownBefore, setShownBefore] = useState(show);

	// a hover from before the sidebar opened or closed must not pop up afterwards
	if (show !== shownBefore) {
		setShownBefore(show);
		setOpen(false);
	}

	return (
		<Tooltip open={show && open} onOpenChange={setOpen}>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent side="right" sideOffset={10}>
				{label}
			</TooltipContent>
		</Tooltip>
	);
}

'use client';

import type { ReactElement } from 'react';
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
	return (
		<Tooltip {...(show ? {} : { open: false })}>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent side="right" sideOffset={10}>
				{label}
			</TooltipContent>
		</Tooltip>
	);
}

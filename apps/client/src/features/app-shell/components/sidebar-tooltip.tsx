'use client';

import type { ReactElement } from 'react';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTooltipWhen } from '@/hooks/use-tooltip-when';

type SidebarTooltipProps = {
	label: string;
	// same tree in both states, so focus is not lost on toggle
	show: boolean;
	children: ReactElement;
};

export function SidebarTooltip({ label, show, children }: SidebarTooltipProps) {
	const tooltip = useTooltipWhen(show);

	return (
		<Tooltip {...tooltip}>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent side="right" sideOffset={10}>
				{label}
			</TooltipContent>
		</Tooltip>
	);
}

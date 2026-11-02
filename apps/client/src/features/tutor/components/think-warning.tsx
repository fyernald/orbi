'use client';

import { TriangleAlert } from 'lucide-react';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';

// A button, so the tooltip also opens on keyboard focus; Radix links the tooltip
// to it with aria-describedby, so screen readers read the warning too
export function ThinkWarning() {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					aria-label="Warning"
					className="flex size-6 items-center justify-center rounded-full bg-tone-amber text-tone-amber-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
				>
					<TriangleAlert className="size-3.5" strokeWidth={2.25} />
				</button>
			</TooltipTrigger>
			<TooltipContent sideOffset={6}>
				Thinking drains your limit faster.
			</TooltipContent>
		</Tooltip>
	);
}

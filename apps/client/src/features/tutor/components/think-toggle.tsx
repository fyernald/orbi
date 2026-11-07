'use client';

import { Lightbulb, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type ThinkToggleProps = {
	on: boolean;
	onChange: (on: boolean) => void;
};

// whether the model thinks before it answers; off by default, as thinking costs the most.
// Radix links the tooltip to the button with aria-describedby, so screen readers hear the
// warning too, and a tap on a touch screen only turns Think on or off
export function ThinkToggle({ on, onChange }: ThinkToggleProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					role="switch"
					aria-checked={on}
					aria-label="Think"
					onClick={() => onChange(!on)}
					className={cn(
						'h-9 gap-1.5 rounded-full px-2.5 text-[13px] text-subtle-foreground',
						on &&
							'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
					)}
				>
					<Lightbulb className="size-4" />
					<span className="hidden sm:inline">Think</span>
				</Button>
			</TooltipTrigger>
			<TooltipContent sideOffset={6}>
				<span
					aria-hidden
					className="flex size-5 shrink-0 items-center justify-center rounded-full bg-tone-amber text-tone-amber-foreground"
				>
					<TriangleAlert className="size-3" strokeWidth={2.25} />
				</span>
				Thinking drains your limit faster.
			</TooltipContent>
		</Tooltip>
	);
}

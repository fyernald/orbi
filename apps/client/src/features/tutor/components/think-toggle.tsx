'use client';

import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ThinkToggleProps = {
	on: boolean;
	onChange: (on: boolean) => void;
};

// whether the model thinks before it answers; off by default, as thinking costs the most
export function ThinkToggle({ on, onChange }: ThinkToggleProps) {
	return (
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
	);
}

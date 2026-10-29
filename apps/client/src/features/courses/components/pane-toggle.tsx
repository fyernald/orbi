import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PaneToggleProps = {
	label: string;
	pressed: boolean;
	onClick: () => void;
	icon: ReactNode;
};

// only wide screens show the side panes next to the tutor, so phones hide it
export function PaneToggle({ label, pressed, onClick, icon }: PaneToggleProps) {
	return (
		<Button
			variant="ghost"
			size="icon-sm"
			onClick={onClick}
			aria-label={label}
			aria-pressed={pressed}
			className={cn(
				'hidden rounded-md text-muted-foreground lg:inline-flex',
				pressed && 'text-foreground'
			)}
		>
			{icon}
		</Button>
	);
}

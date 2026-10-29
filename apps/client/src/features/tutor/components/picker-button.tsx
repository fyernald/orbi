import { ChevronDown, type LucideIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type PickerButtonProps = ComponentProps<'button'> & {
	icon: LucideIcon;
	tone: string;
};

// the trigger of the composer's action and topic menus; the other props come
// from DropdownMenuTrigger asChild
export function PickerButton({
	icon: Icon,
	tone,
	className,
	children,
	...props
}: PickerButtonProps) {
	return (
		<button
			type="button"
			{...props}
			className={cn(
				'flex h-8 min-w-0 items-center gap-2 rounded-[10px] border border-border pr-2.5 pl-1.5 text-[13px] font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none data-[state=open]:bg-muted',
				className
			)}
		>
			<span
				className={cn(
					'flex size-5 shrink-0 items-center justify-center rounded-md',
					tone
				)}
			>
				<Icon className="size-3" strokeWidth={2} />
			</span>
			{children}
			<ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
		</button>
	);
}

import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';

type ComposerToolButtonProps = {
	icon: LucideIcon;
	label: string;
	hint: string;
	onClick?: () => void;
};

export function ComposerToolButton({
	icon: Icon,
	label,
	hint,
	onClick,
}: ComposerToolButtonProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					type="button"
					variant="outline"
					aria-label={label}
					onClick={onClick}
					className="h-9 gap-1.5 rounded-full px-2.5 text-[13px] text-subtle-foreground sm:pr-3"
				>
					<Icon className="size-4" />
					<span className="hidden sm:inline">{label}</span>
				</Button>
			</TooltipTrigger>
			<TooltipContent sideOffset={6}>{hint}</TooltipContent>
		</Tooltip>
	);
}

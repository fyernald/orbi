import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';

type SendButtonProps = {
	label: string;
	blockedReason: string | null;
};

// aria-disabled instead of disabled, so the button can still be focused
// and hovered to show why it is not ready
export function SendButton({ label, blockedReason }: SendButtonProps) {
	const blocked = blockedReason !== null;

	return (
		<Tooltip {...(blocked ? {} : { open: false })}>
			<TooltipTrigger asChild>
				<Button
					type="submit"
					aria-disabled={blocked || undefined}
					aria-label={label}
					className="h-10 gap-2 rounded-full px-3 text-sm hover:bg-primary/90 aria-disabled:cursor-not-allowed aria-disabled:bg-muted aria-disabled:text-muted-foreground sm:px-4"
				>
					<span className="hidden sm:inline">{label}</span>
					<ArrowUp className="size-4" strokeWidth={2} />
				</Button>
			</TooltipTrigger>
			<TooltipContent sideOffset={6}>{blockedReason}</TooltipContent>
		</Tooltip>
	);
}

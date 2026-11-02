import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function RefreshFollowUpsButton({
	refreshing,
	disabled,
	onRefresh,
}: {
	refreshing: boolean;
	disabled: boolean;
	onRefresh: () => void;
}) {
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			onClick={onRefresh}
			disabled={disabled || refreshing}
			aria-label="Suggest other questions"
			title="Suggest other questions"
			className="rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
		>
			<RefreshCw
				className={cn(
					'size-4',
					refreshing && 'animate-spin motion-reduce:animate-none'
				)}
			/>
		</Button>
	);
}

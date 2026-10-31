import { CircleAlert, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// a reply that failed after it started; the student's message is saved, so it can be tried again
export function ReplyError({
	message,
	onRetry,
}: {
	message: string;
	onRetry: () => void;
}) {
	return (
		<div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-tone-red px-4 py-3 text-sm">
			<CircleAlert className="mt-0.5 size-4 shrink-0 text-tone-red-foreground" />
			<div className="flex min-w-0 flex-1 flex-col gap-2.5">
				<p>
					<span className="font-medium text-tone-red-foreground">
						{message}
					</span>{' '}
					Your notes and earlier messages are safe.
				</p>
				<Button
					type="button"
					variant="outline"
					onClick={onRetry}
					className="h-8 self-start rounded-lg px-3"
				>
					<RotateCcw />
					Try again
				</Button>
			</div>
		</div>
	);
}

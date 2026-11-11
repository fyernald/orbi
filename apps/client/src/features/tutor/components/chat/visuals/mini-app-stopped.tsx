import { RotateCcw, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	failureMessages,
	type MiniAppFailure,
} from '../../../visuals/mini-app-frame-state';

// In place of a mini-app that was closed: why, and a way to try again. The error
// itself is shown small, so the student can paste it to Orbi.
export function MiniAppStopped({
	failure,
	detail,
	onTryAgain,
}: {
	failure: MiniAppFailure;
	detail?: string;
	onTryAgain: () => void;
}) {
	return (
		<div
			role="alert"
			className="flex items-start gap-3 rounded-lg bg-muted/60 p-4"
		>
			<TriangleAlert
				aria-hidden
				className="mt-0.5 size-4 shrink-0 text-muted-foreground"
			/>
			<div className="flex min-w-0 flex-1 flex-col items-start gap-3">
				<div className="flex flex-col gap-1">
					<p className="text-sm">{failureMessages[failure]}</p>
					{detail && (
						<p className="font-mono text-xs break-all text-muted-foreground">
							{detail}
						</p>
					)}
				</div>
				<Button variant="outline" size="sm" onClick={onTryAgain}>
					<RotateCcw />
					Try again
				</Button>
			</div>
		</div>
	);
}

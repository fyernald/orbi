import { RotateCcw, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { VisualKind } from './visual-skeleton';

const kindNames: Record<VisualKind, string> = {
	diagram: 'diagram',
	chart: 'chart',
	interactive: 'interactive tool',
};

// In place of a visual that could not be made or drawn. The rest of the reply
// still shows; Try again makes or draws it once more, when it can.
export function VisualError({
	kind,
	title,
	onRetry,
}: {
	kind: VisualKind;
	title?: string;
	onRetry?: () => void;
}) {
	const name = kindNames[kind];
	return (
		<div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
			<TriangleAlert
				aria-hidden
				className="mt-0.5 size-4 shrink-0 text-muted-foreground"
			/>
			<div className="flex min-w-0 flex-1 flex-col items-start gap-3">
				<div className="flex flex-col gap-0.5">
					<p className="text-sm font-semibold">{title ?? `Orbi's ${name}`}</p>
					<p className="text-sm text-muted-foreground">
						Orbi could not draw this {name}. The rest of the reply is fine.
					</p>
				</div>
				{onRetry && (
					<Button variant="outline" size="sm" onClick={onRetry}>
						<RotateCcw />
						Try again
					</Button>
				)}
			</div>
		</div>
	);
}

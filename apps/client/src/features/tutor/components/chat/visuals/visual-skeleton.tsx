import type { JSX } from 'react';
import { Thinking } from '../thinking';

export type VisualKind = 'diagram' | 'chart' | 'interactive' | 'miniApp';

const makingLines: Record<VisualKind, string> = {
	diagram: 'Orbi is creating your diagram…',
	chart: 'Drawing your chart…',
	interactive: 'Building your interactive tool…',
	miniApp: 'Building your mini-app…',
};

// the boxes of a small tree: three rows, one, two and three wide
const DIAGRAM_ROWS = [1, 2, 3];
const CHART_BARS = [40, 70, 55, 85, 30, 65];

function DiagramShape() {
	return (
		<div className="flex flex-col items-center gap-5">
			{DIAGRAM_ROWS.map((count) => (
				<div key={count} className="flex gap-4">
					{Array.from({ length: count }, (_, index) => (
						<div key={index} className="h-8 w-16 rounded-lg bg-muted sm:w-20" />
					))}
				</div>
			))}
		</div>
	);
}

function ChartShape() {
	return (
		<div className="flex h-36 items-end gap-3 border-b border-l border-border px-3">
			{CHART_BARS.map((height, index) => (
				<div
					key={index}
					className="flex-1 rounded-t-md bg-muted"
					style={{ height: `${height}%` }}
				/>
			))}
		</div>
	);
}

function InteractiveShape() {
	return (
		<div className="flex flex-col gap-4">
			<div className="h-2 w-2/3 rounded-full bg-muted" />
			<div className="h-28 rounded-lg bg-muted" />
		</div>
	);
}

// a small window: a bar of buttons over the app
function MiniAppShape() {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex gap-2">
				<div className="h-7 w-20 rounded-lg bg-muted" />
				<div className="h-7 w-16 rounded-lg bg-muted" />
			</div>
			<div className="h-32 rounded-lg bg-muted" />
		</div>
	);
}

const shapes: Record<VisualKind, () => JSX.Element> = {
	diagram: DiagramShape,
	chart: ChartShape,
	interactive: InteractiveShape,
	miniApp: MiniAppShape,
};

// Holds the visual's place while Orbi makes it, shaped like what is coming. The
// title shows as soon as it has arrived. It pulses gently, and stands still for
// students who turned motion down.
export function VisualSkeleton({
	kind,
	title,
}: {
	kind: VisualKind;
	title?: string;
}) {
	const Shape = shapes[kind];
	return (
		<div
			role="status"
			className="overflow-hidden rounded-2xl border border-border bg-card"
		>
			<div className="flex flex-col gap-0.5 border-b border-divider px-4 py-2.5">
				{title ? (
					<p className="truncate text-sm font-semibold">{title}</p>
				) : (
					<div className="my-1 h-3 w-40 rounded-full bg-muted" />
				)}
				<Thinking label={makingLines[kind]} className="text-xs" />
			</div>
			<div aria-hidden className="p-6 motion-safe:animate-pulse">
				<Shape />
			</div>
		</div>
	);
}

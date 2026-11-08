'use client';

import type { ChartType, CreateChartInput } from '@orbi/shared';
import {
	ChartArea,
	ChartColumn,
	ChartColumnBig,
	ChartLine,
	ChartPie,
	ChartScatter,
	ChartSpline,
	type LucideIcon,
} from 'lucide-react';
import { lazy, Suspense, useRef, useState } from 'react';
import { legendNames } from '../../../visuals/chart-legend';
import { readChartSvg } from '../../../visuals/chart-svg';
import { chartSource, chartTable } from '../../../visuals/chart-table';
import { streamedTitle } from '../../../visuals/streamed-title';
import { svgDownloads } from '../../../visuals/svg-downloads';
import type { ToolViewProps } from '../tool-views';
import { ChartDataTable } from './chart-data-table';
import {
	CopySourceAction,
	DownloadAction,
	FullScreenAction,
} from './visual-actions';
import { VisualCard } from './visual-card';
import { VisualError } from './visual-error';
import { VisualErrorBoundary } from './visual-error-boundary';
import { VisualFullScreen } from './visual-full-screen';
import { VisualSkeleton } from './visual-skeleton';

// Recharts loads with the first chart in a chat
const ChartPlot = lazy(() => import('./chart-plot'));

const chartKinds: Record<ChartType, { label: string; icon: LucideIcon }> = {
	bar: { label: 'Bar chart', icon: ChartColumnBig },
	line: { label: 'Line chart', icon: ChartLine },
	area: { label: 'Area chart', icon: ChartArea },
	pie: { label: 'Pie chart', icon: ChartPie },
	scatter: { label: 'Scatter plot', icon: ChartScatter },
	histogram: { label: 'Histogram', icon: ChartColumn },
	function: { label: 'Function plot', icon: ChartSpline },
};

// the createChart tool: a skeleton while Orbi writes it, then the chart
export function ChartView({ part, onRetry }: ToolViewProps<'createChart'>) {
	if (part.state === 'output-error') {
		return (
			<VisualError
				kind="chart"
				title={streamedTitle(part.input)}
				onRetry={onRetry}
			/>
		);
	}
	if (part.state !== 'output-available') {
		return <VisualSkeleton kind="chart" title={streamedTitle(part.input)} />;
	}
	return (
		<VisualErrorBoundary
			fallback={(redraw) => (
				// the last reply is asked again; an older one is drawn again
				<VisualError
					kind="chart"
					title={part.input.title}
					onRetry={onRetry ?? redraw}
				/>
			)}
		>
			<Chart input={part.input} />
		</VisualErrorBoundary>
	);
}

// holds the chart's place in the card while Recharts loads
function PlotPlaceholder() {
	return (
		<div
			aria-hidden
			className="h-64 rounded-lg bg-muted motion-safe:animate-pulse"
		/>
	);
}

function Chart({ input }: { input: CreateChartInput }) {
	const [fullScreen, setFullScreen] = useState(false);
	const plot = useRef<HTMLDivElement>(null);
	const { label, icon } = chartKinds[input.type];
	const table = chartTable(input);
	const readSvg = () =>
		readChartSvg(plot.current, input.title, legendNames(input));

	return (
		<>
			<VisualCard
				title={input.title}
				label={label}
				icon={icon}
				description={input.description}
				toolbar={
					<>
						<CopySourceAction source={chartSource(input)} label="Copy data" />
						<DownloadAction options={svgDownloads(readSvg, input.title)} />
						<FullScreenAction onOpen={() => setFullScreen(true)} />
					</>
				}
			>
				<div ref={plot}>
					<Suspense fallback={<PlotPlaceholder />}>
						<ChartPlot input={input} />
					</Suspense>
				</div>
				{table && <ChartDataTable table={table} caption={input.title} />}
			</VisualCard>
			<VisualFullScreen
				open={fullScreen}
				onOpenChange={setFullScreen}
				title={input.title}
				description={input.description}
			>
				<Suspense fallback={<PlotPlaceholder />}>
					<ChartPlot input={input} large />
				</Suspense>
			</VisualFullScreen>
		</>
	);
}

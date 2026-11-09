'use client';

import type { CreateChartInput } from '@orbi/shared';
import { useMemo } from 'react';
import { ChartContainer } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { barRowsHeight, labelsFitAcross } from '../../../visuals/chart-layout';
import { chartConfig, legendEntries } from '../../../visuals/chart-legend';
import {
	binValues,
	categoryRows,
	histogramRows,
} from '../../../visuals/chart-rows';
import { plotFunctions } from '../../../visuals/function-plot';
import { useElementWidth } from '../../../visuals/use-element-width';
import { BarRowsPlot } from './bar-rows-plot';
import { CategoryPlot } from './category-plot';
import { ChartKey } from './chart-key';
import { FormulaPlot } from './formula-plot';
import { PiePlot } from './pie-plot';
import { ScatterPlot } from './scatter-plot';

// Bars whose names would not all fit under them go in rows instead. Before the
// chart has a width, they stay upright.
const barsInRows = (input: CreateChartInput, width: number) =>
	input.type === 'bar' &&
	width > 0 &&
	!labelsFitAcross(input.labels ?? [], width);

type PlotProps = { input: CreateChartInput; width: number };

// the Recharts chart for each chart type
function Plot({ input, width }: PlotProps) {
	const { type, series, xLabel, yLabel } = input;
	const axes = { xLabel, yLabel };
	switch (type) {
		case 'bar':
			if (barsInRows(input, width)) {
				return (
					<BarRowsPlot
						rows={categoryRows(input.labels ?? [], series)}
						seriesCount={series.length}
						width={width}
						{...axes}
					/>
				);
			}
			return (
				<CategoryPlot
					mark="bar"
					rows={categoryRows(input.labels ?? [], series)}
					seriesCount={series.length}
					{...axes}
				/>
			);
		case 'line':
		case 'area':
			return (
				<CategoryPlot
					mark={type}
					rows={categoryRows(input.labels ?? [], series)}
					seriesCount={series.length}
					{...axes}
				/>
			);
		case 'histogram':
			return (
				<CategoryPlot
					mark="histogram"
					rows={histogramRows(binValues(series[0]?.values ?? [], input.bins))}
					seriesCount={1}
					{...axes}
				/>
			);
		case 'pie':
			return (
				<PiePlot labels={input.labels ?? []} values={series[0]?.values ?? []} />
			);
		case 'scatter':
			return <ScatterPlot series={series} width={width} {...axes} />;
		case 'function': {
			const xMin = input.xMin ?? -1;
			const xMax = input.xMax ?? 1;
			return (
				<FormulaPlot
					plot={plotFunctions(series, xMin, xMax, input.yMin, input.yMax)}
					seriesCount={series.length}
					xMin={xMin}
					xMax={xMax}
					width={width}
					{...axes}
				/>
			);
		}
	}
}

// A chart with its legend. Recharts is large, so this file loads with the first
// chart in a chat, not with the page. It follows the theme through the CSS
// colour tokens, so light and dark mode need no redraw.
export default function ChartPlot({
	input,
	large,
}: {
	input: CreateChartInput;
	large?: boolean;
}) {
	const config = useMemo(() => chartConfig(input), [input]);
	const entries = legendEntries(input);
	const { ref, width } = useElementWidth();
	const inRows = barsInRows(input, width);
	return (
		<div ref={ref} className="flex flex-col gap-3">
			{entries.length > 0 && <ChartKey entries={entries} />}
			<ChartContainer
				config={config}
				className={cn(
					'aspect-auto w-full [&_.recharts-label]:fill-muted-foreground',
					!inRows && (large ? 'h-[60dvh]' : 'h-64')
				)}
				style={
					inRows
						? {
								height: barRowsHeight(
									input.labels?.length ?? 0,
									input.series.length
								),
							}
						: undefined
				}
			>
				<Plot input={input} width={width} />
			</ChartContainer>
		</div>
	);
}

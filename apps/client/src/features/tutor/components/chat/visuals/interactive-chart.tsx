'use client';

import type {
	CompiledInteractive,
	FormulaScope,
	InteractiveChart as ChartSpec,
} from '@orbi/shared';
import { useDeferredValue, useMemo } from 'react';
import { ChartContainer } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { seriesConfig } from '../../../visuals/chart-legend';
import { interactivePlot } from '../../../visuals/interactive-plot';
import { useElementWidth } from '../../../visuals/use-element-width';
import { ChartKey } from './chart-key';
import { FormulaPlot } from './formula-plot';

type InteractiveChartProps = {
	chart: ChartSpec;
	compiled: CompiledInteractive;
	scope: FormulaScope;
	large?: boolean;
};

// The chart of an interactive tool, drawn again as the controls move. Like
// ChartPlot, it loads Recharts with the first chart in a chat.
export default function InteractiveChart({
	chart,
	compiled,
	scope,
	large,
}: InteractiveChartProps) {
	// a fast drag redraws the chart only as often as the browser keeps up
	const drawnScope = useDeferredValue(scope);
	const plot = useMemo(
		() => interactivePlot(compiled, drawnScope, chart),
		[compiled, drawnScope, chart]
	);
	const names = useMemo(
		() => chart.curves.map(({ name }) => name),
		[chart.curves]
	);
	const config = useMemo(() => seriesConfig(names), [names]);
	const { ref, width } = useElementWidth();
	return (
		<div ref={ref} className="flex flex-col gap-3">
			{names.length > 1 && (
				<ChartKey entries={names.map((name) => ({ name }))} />
			)}
			<ChartContainer
				config={config}
				className={cn(
					'aspect-auto w-full [&_.recharts-label]:fill-muted-foreground',
					large ? 'h-[50dvh]' : 'h-56'
				)}
			>
				<FormulaPlot
					plot={plot}
					seriesCount={chart.curves.length}
					xMin={chart.xMin}
					xMax={chart.xMax}
					width={width}
					xLabel={chart.xLabel}
					yLabel={chart.yLabel}
					shaded={plot.shaded}
					markers={plot.markers}
				/>
			</ChartContainer>
		</div>
	);
}

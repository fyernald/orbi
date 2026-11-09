import { ComposedChart, Line, ReferenceLine } from 'recharts';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { seriesKey } from '../../../visuals/chart-colors';
import { AXES_MARGIN, numberAxisSteps } from '../../../visuals/chart-layout';
import type { FunctionPlot } from '../../../visuals/function-plot';
import { ticksWithin } from '../../../visuals/nice-scale';
import { formatNumber } from '../../../visuals/number-format';
import { chartAxes } from './chart-axes';

type FormulaPlotProps = {
	plot: FunctionPlot;
	seriesCount: number;
	xMin: number;
	xMax: number;
	// the chart's width, to mark as many x steps as fit
	width: number;
	xLabel?: string;
	yLabel?: string;
};

const inRange = (value: number, [low, high]: readonly [number, number]) =>
	value > low && value < high;

const xOfPoint = (payload: readonly { payload?: unknown }[]) => {
	const row = payload[0]?.payload as { x?: unknown } | undefined;
	return typeof row?.x === 'number' ? `x = ${formatNumber(row.x)}` : '';
};

// Curves of formulas over x, with the x and y axes drawn where they cross 0.
export function FormulaPlot({
	plot,
	seriesCount,
	xMin,
	xMax,
	width,
	xLabel,
	yLabel,
}: FormulaPlotProps) {
	return (
		<ComposedChart data={plot.rows} margin={AXES_MARGIN}>
			{chartAxes({
				xLabel,
				yLabel,
				xType: 'number',
				xKey: 'x',
				xDomain: [xMin, xMax],
				yDomain: plot.yDomain,
				xTicks: ticksWithin(xMin, xMax, numberAxisSteps(width)),
				yTicks: plot.yTicks,
				clipY: true,
			})}
			{inRange(0, plot.yDomain) && (
				<ReferenceLine y={0} stroke="var(--muted-foreground)" />
			)}
			{inRange(0, [xMin, xMax]) && (
				<ReferenceLine x={0} stroke="var(--muted-foreground)" />
			)}
			<ChartTooltip
				content={
					<ChartTooltipContent
						labelFormatter={(_, payload) => xOfPoint(payload)}
					/>
				}
			/>
			{Array.from({ length: seriesCount }, (_, index) => (
				<Line
					key={seriesKey(index)}
					dataKey={seriesKey(index)}
					type="monotone"
					stroke={`var(--color-${seriesKey(index)})`}
					strokeWidth={2}
					dot={false}
					activeDot={{ r: 4, stroke: 'var(--card)', strokeWidth: 2 }}
					isAnimationActive={false}
				/>
			))}
		</ComposedChart>
	);
}

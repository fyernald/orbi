import { Area, ComposedChart, Line, ReferenceLine } from 'recharts';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { seriesKey, shadeKey } from '../../../visuals/chart-colors';
import { AXES_MARGIN, numberAxisSteps } from '../../../visuals/chart-layout';
import type { FunctionPlot } from '../../../visuals/function-plot';
import type { ChartMarker } from '../../../visuals/interactive-plot';
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
	// the series with an area shaded under them, by index
	shaded?: number[];
	// upright lines at given x, like the z of a z-score tool
	markers?: ChartMarker[];
};

const inRange = (value: number, [low, high]: readonly [number, number]) =>
	value > low && value < high;

const xOfPoint = (payload: readonly { payload?: unknown }[]) => {
	const row = payload[0]?.payload as { x?: unknown } | undefined;
	return typeof row?.x === 'number' ? `x = ${formatNumber(row.x)}` : '';
};

// the y a shaded area reaches down to: 0, or the edge of the chart nearest it
const shadeBase = ([low, high]: readonly [number, number]) =>
	Math.min(high, Math.max(low, 0));

// Curves of formulas over x, with the x and y axes drawn where they cross 0.
export function FormulaPlot({
	plot,
	seriesCount,
	xMin,
	xMax,
	width,
	xLabel,
	yLabel,
	shaded = [],
	markers = [],
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
			{shaded.map((index) => (
				<Area
					key={shadeKey(index)}
					dataKey={shadeKey(index)}
					type="monotone"
					baseValue={shadeBase(plot.yDomain)}
					stroke="none"
					fill={`var(--color-${seriesKey(index)})`}
					fillOpacity={0.25}
					activeDot={false}
					tooltipType="none"
					isAnimationActive={false}
				/>
			))}
			{markers.map(({ label, x }) => (
				<ReferenceLine
					key={label}
					x={x}
					stroke="var(--foreground)"
					strokeDasharray="4 3"
					label={{
						value: label,
						position: 'top',
						fontSize: 12,
						fill: 'var(--muted-foreground)',
					}}
				/>
			))}
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

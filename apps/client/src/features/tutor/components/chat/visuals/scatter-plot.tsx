import type { ChartSeriesInput } from '@orbi/shared';
import { Scatter, ScatterChart, ZAxis } from 'recharts';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { seriesKey } from '../../../visuals/chart-colors';
import { AXES_MARGIN, numberAxisSteps } from '../../../visuals/chart-layout';
import { pointScales } from '../../../visuals/chart-rows';
import { chartAxes } from './chart-axes';

// the area of each dot: about 8px across
const DOT_AREA = 64;

type ScatterPlotProps = {
	series: ChartSeriesInput[];
	// the chart's width, to mark as many x steps as fit
	width: number;
	xLabel?: string;
	yLabel?: string;
};

const seriesOfPoint = (payload: readonly { payload?: unknown }[]) => {
	const point = payload[0]?.payload as { series?: unknown } | undefined;
	return typeof point?.series === 'string' ? point.series : '';
};

// Dots of two measures, a colour per series, each with a ring in the card's
// colour so overlapping dots stay apart.
export function ScatterPlot({
	series,
	width,
	xLabel,
	yLabel,
}: ScatterPlotProps) {
	const scales = pointScales(series, numberAxisSteps(width));
	return (
		<ScatterChart margin={AXES_MARGIN}>
			{chartAxes({
				xLabel,
				yLabel,
				xType: 'number',
				xKey: 'x',
				yKey: 'y',
				xDomain: scales.x.domain,
				yDomain: scales.y.domain,
				xTicks: scales.x.ticks,
				yTicks: scales.y.ticks,
			})}
			<ZAxis range={[DOT_AREA, DOT_AREA]} />
			<ChartTooltip
				content={
					<ChartTooltipContent
						labelFormatter={(_, payload) => seriesOfPoint(payload)}
					/>
				}
			/>
			{series.map(({ name, points = [] }, index) => (
				<Scatter
					key={seriesKey(index)}
					name={name}
					data={points.map((point) => ({ ...point, series: name }))}
					fill={`var(--color-${seriesKey(index)})`}
					stroke="var(--card)"
					strokeWidth={2}
					isAnimationActive={false}
				/>
			))}
		</ScatterChart>
	);
}

import { Area, Bar, ComposedChart, Line } from 'recharts';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { seriesKey } from '../../../visuals/chart-colors';
import type { ChartRow } from '../../../visuals/chart-rows';
import { AXES_MARGIN, chartAxes } from './chart-axes';

export type CategoryMark = 'bar' | 'line' | 'area' | 'histogram';

// line points get a dot only when there are few enough to tell apart
const DOTS_MAX = 12;

type CategoryPlotProps = {
	mark: CategoryMark;
	rows: ChartRow[];
	seriesCount: number;
	xLabel?: string;
	yLabel?: string;
};

const colorOf = (index: number) => `var(--color-${seriesKey(index)})`;

// the marks of one series, in the specs every Orbi chart shares
function seriesMark(mark: CategoryMark, index: number, dots: boolean) {
	const key = seriesKey(index);
	const color = colorOf(index);
	if (mark === 'line') {
		return (
			<Line
				key={key}
				dataKey={key}
				type="linear"
				stroke={color}
				strokeWidth={2}
				dot={
					dots && { r: 4, fill: color, stroke: 'var(--card)', strokeWidth: 2 }
				}
				activeDot={{ r: 5, stroke: 'var(--card)', strokeWidth: 2 }}
				isAnimationActive={false}
			/>
		);
	}
	if (mark === 'area') {
		return (
			<Area
				key={key}
				dataKey={key}
				type="linear"
				stroke={color}
				strokeWidth={2}
				fill={color}
				fillOpacity={0.1}
				activeDot={{ r: 5, stroke: 'var(--card)', strokeWidth: 2 }}
				isAnimationActive={false}
			/>
		);
	}
	return (
		<Bar
			key={key}
			dataKey={key}
			fill={color}
			radius={[4, 4, 0, 0]}
			maxBarSize={mark === 'histogram' ? undefined : 24}
			isAnimationActive={false}
		/>
	);
}

// Bar, line and area charts of values per label, and histograms (bars that touch,
// with a thin gap between them).
export function CategoryPlot({
	mark,
	rows,
	seriesCount,
	xLabel,
	yLabel,
}: CategoryPlotProps) {
	const dots = rows.length <= DOTS_MAX;
	return (
		<ComposedChart
			data={rows}
			margin={AXES_MARGIN}
			barGap={2}
			barCategoryGap={mark === 'histogram' ? 2 : '20%'}
		>
			{chartAxes({ xLabel, yLabel, xType: 'category', xKey: 'label' })}
			<ChartTooltip content={<ChartTooltipContent />} />
			{Array.from({ length: seriesCount }, (_, index) =>
				seriesMark(mark, index, dots)
			)}
		</ComposedChart>
	);
}

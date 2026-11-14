import { ComposedChart } from 'recharts';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AXES_MARGIN, labelColumnWidth } from '../../../visuals/chart-layout';
import { valueScale, type ChartRow } from '../../../visuals/chart-rows';
import { barMark } from './category-plot';
import { barRowAxes } from './chart-axes';

type BarRowsPlotProps = {
	rows: ChartRow[];
	seriesCount: number;
	// the chart's width, to size the column of names
	width: number;
	xLabel?: string;
	yLabel?: string;
};

// A bar chart turned on its side, for names too long to fit under the bars (a
// phone, or many labels): every bar keeps its name on the left, and the bars run
// right along the values.
export function BarRowsPlot({
	rows,
	seriesCount,
	width,
	xLabel,
	yLabel,
}: BarRowsPlotProps) {
	const labels = rows.map(({ label }) => String(label));
	return (
		<ComposedChart
			data={rows}
			layout="vertical"
			margin={AXES_MARGIN}
			barGap={2}
			barCategoryGap="20%"
		>
			{barRowAxes({
				labelName: xLabel,
				valueName: yLabel,
				values: valueScale(rows, seriesCount),
				labelWidth: labelColumnWidth(labels, width),
			})}
			<ChartTooltip content={<ChartTooltipContent />} />
			{Array.from({ length: seriesCount }, (_, index) =>
				barMark(index, { inRows: true })
			)}
		</ComposedChart>
	);
}

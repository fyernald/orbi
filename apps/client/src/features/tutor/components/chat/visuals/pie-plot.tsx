import { Pie, PieChart } from 'recharts';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { chartColor } from '../../../visuals/chart-colors';

type PiePlotProps = { labels: string[]; values: number[] };

// Parts of one whole as a ring, a colour per slice, with a gap in the card's
// colour between slices. The legend beside it gives each share.
export function PiePlot({ labels, values }: PiePlotProps) {
	const slices = labels.map((name, index) => ({
		name,
		value: values[index] ?? 0,
		fill: chartColor(index),
	}));
	return (
		<PieChart>
			<ChartTooltip content={<ChartTooltipContent hideLabel />} />
			<Pie
				data={slices}
				dataKey="value"
				nameKey="name"
				innerRadius="55%"
				outerRadius="90%"
				stroke="var(--card)"
				strokeWidth={2}
				isAnimationActive={false}
			/>
		</PieChart>
	);
}

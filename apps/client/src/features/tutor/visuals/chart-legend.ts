import type { CreateChartInput } from '@orbi/shared';
import type { ChartConfig } from '@/components/ui/chart';
import { chartColor, seriesKey } from './chart-colors';

export type LegendEntry = { name: string; detail?: string };

const percent = new Intl.NumberFormat('en', {
	style: 'percent',
	maximumFractionDigits: 0,
});

// The names the legend shows: each slice of a pie with its share, or each series
// when there are two or more. One series needs none, the title names it.
export function legendEntries(input: CreateChartInput): LegendEntry[] {
	if (input.type === 'pie') {
		const values = input.series[0]?.values ?? [];
		const total = values.reduce((sum, value) => sum + value, 0);
		return (input.labels ?? []).map((name, index) => ({
			name,
			detail: total > 0 ? percent.format((values[index] ?? 0) / total) : '',
		}));
	}
	if (input.series.length < 2) return [];
	return input.series.map(({ name }) => ({ name }));
}

// the legend as text, for the SVG download
export const legendNames = (input: CreateChartInput) =>
	legendEntries(input).map(({ name, detail }) =>
		detail ? `${name} ${detail}` : name
	);

// each series' name and colour, which the chart parts read as --color-s0, s1…
export const seriesConfig = (names: string[]): ChartConfig =>
	Object.fromEntries(
		names.map((name, index) => [
			seriesKey(index),
			{ label: name, color: chartColor(index) },
		])
	);

export const chartConfig = (input: CreateChartInput) =>
	seriesConfig(input.series.map(({ name }) => name));

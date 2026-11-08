import {
	CHART_BINS_MAX,
	CHART_BINS_MIN,
	type ChartSeriesInput,
} from '@orbi/shared';
import { seriesKey } from './chart-colors';
import { formatNumber } from './number-format';

// one row of a chart's data: the label or x, then a value per series (s0, s1…)
export type ChartRow = Record<string, string | number | null>;

// a row per label, with the value of every series for it
export function categoryRows(
	labels: string[],
	series: ChartSeriesInput[]
): ChartRow[] {
	return labels.map((label, index) => {
		const row: ChartRow = { label };
		series.forEach(({ values }, seriesIndex) => {
			row[seriesKey(seriesIndex)] = values?.[index] ?? null;
		});
		return row;
	});
}

export type Bin = { from: number; to: number; count: number };

// a round step near `raw`: 1, 2, 2.5 or 5 times a power of ten
export function niceStep(raw: number): number {
	const power = 10 ** Math.floor(Math.log10(raw));
	const step = [1, 2, 2.5, 5, 10].find((factor) => factor * power >= raw);
	return (step ?? 10) * power;
}

// Sturges's rule: about log2(n) + 1 bars
const defaultBinCount = (count: number) =>
	Math.min(
		Math.max(Math.ceil(Math.log2(count)) + 1, CHART_BINS_MIN),
		CHART_BINS_MAX
	);

// The values counted into bars of the same round width (50–60, 60–70…), about
// `wanted` of them. The highest value counts in the last bar.
export function binValues(values: number[], wanted?: number): Bin[] {
	const min = Math.min(...values);
	const max = Math.max(...values);
	if (min === max) return [{ from: min, to: max, count: values.length }];
	const step = niceStep(
		(max - min) / (wanted ?? defaultBinCount(values.length))
	);
	const start = Math.floor(min / step) * step;
	const count = Math.max(1, Math.ceil((max - start) / step));
	const bins = Array.from({ length: count }, (_, index) => ({
		from: start + index * step,
		to: start + (index + 1) * step,
		count: 0,
	}));
	for (const value of values) {
		const index = Math.min(Math.floor((value - start) / step), count - 1);
		bins[index]!.count += 1;
	}
	return bins;
}

export const binLabel = ({ from, to }: Bin) =>
	from === to
		? formatNumber(from)
		: `${formatNumber(from)}–${formatNumber(to)}`;

export const histogramRows = (bins: Bin[]): ChartRow[] =>
	bins.map((bin) => ({ label: binLabel(bin), [seriesKey(0)]: bin.count }));

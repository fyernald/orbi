import {
	CHART_BINS_MAX,
	CHART_BINS_MIN,
	type ChartSeriesInput,
} from '@orbi/shared';
import { seriesKey } from './chart-colors';
import { niceScale, niceStep, type Range, type Scale } from './nice-scale';
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

// the lowest and highest value of any series, or nothing when there is none
export function valueExtent(
	rows: ChartRow[],
	seriesCount: number
): Range | undefined {
	const values = rows.flatMap((row) =>
		Array.from({ length: seriesCount }, (_, index) => row[seriesKey(index)])
	);
	const numbers = values.filter(
		(value): value is number =>
			typeof value === 'number' && Number.isFinite(value)
	);
	return numbers.length
		? [Math.min(...numbers), Math.max(...numbers)]
		: undefined;
}

type ValueScaleOptions = {
	// histogram counts step by whole numbers
	wholeNumbers?: boolean;
	// bars and areas show size by their length, so they start at 0
	fromZero?: boolean;
};

// The value axis of a bar, line or area chart or a histogram, in round steps: from
// 0 to past the highest value, or for lines around the values, so lines close
// together (heights of 155 to 170 cm) do not lie flat on top of each other.
export function valueScale(
	rows: ChartRow[],
	seriesCount: number,
	{ wholeNumbers = false, fromZero = true }: ValueScaleOptions = {}
): Scale {
	const [low, high] = valueExtent(rows, seriesCount) ?? [0, 0];
	return fromZero
		? niceScale(Math.min(0, low), Math.max(0, high), { wholeNumbers })
		: niceScale(low, high, { wholeNumbers });
}

// Both axes of a scatter plot, around its points in round steps, with about
// `xSteps` along x. They need not start at 0: the pattern of the dots is what it
// shows.
export function pointScales(
	series: ChartSeriesInput[],
	xSteps?: number
): { x: Scale; y: Scale } {
	const points = series.flatMap(({ points = [] }) => points);
	const around = (values: number[], steps?: number) =>
		niceScale(Math.min(...values), Math.max(...values), { steps });
	return {
		x: around(
			points.map(({ x }) => x),
			xSteps
		),
		y: around(points.map(({ y }) => y)),
	};
}

export type Bin = { from: number; to: number; count: number };

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

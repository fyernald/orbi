import { compileFormula, type ChartSeriesInput } from '@orbi/shared';
import { seriesKey } from './chart-colors';
import type { ChartRow } from './chart-rows';

// enough points for a smooth curve across the chat's width
export const FUNCTION_SAMPLES = 201;

export type YRange = [number, number];

export type FunctionPlot = { rows: ChartRow[]; yDomain: YRange };

const quantile = (sorted: number[], share: number) =>
	sorted[Math.min(sorted.length - 1, Math.floor(share * sorted.length))]!;

// The y range that shows the curve, not its spikes: tan(x) runs off to huge values
// near its asymptotes, which would flatten everything else. Values far beyond the
// middle 90% are left out of the range.
export function curveRange(values: number[]): YRange {
	const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
	if (sorted.length === 0) return [-1, 1];
	const low = quantile(sorted, 0.05);
	const high = quantile(sorted, 0.95);
	const spread = high - low || Math.abs(high) || 1;
	const kept = sorted.filter(
		(value) => value >= low - spread && value <= high + spread
	);
	const min = kept[0]!;
	const max = kept.at(-1)!;
	return min === max ? [min - 1, max + 1] : [min, max];
}

// A row per x across the range, with the y of every formula. A y that is not a
// number (sqrt of a negative) or far off the chart is left empty, so the line
// breaks there instead of jumping across an asymptote.
export function plotFunctions(
	series: ChartSeriesInput[],
	xMin: number,
	xMax: number,
	yMin?: number,
	yMax?: number,
	samples = FUNCTION_SAMPLES
): FunctionPlot {
	const formulas = series.map(({ expression = '' }) => {
		const formula = compileFormula(expression);
		if (!formula.ok) throw new Error(formula.problem);
		return formula.evaluate;
	});
	const xs = Array.from(
		{ length: samples },
		(_, index) => xMin + ((xMax - xMin) * index) / (samples - 1)
	);
	const ys = formulas.map((evaluate) => xs.map((x) => evaluate({ x })));

	const auto = curveRange(ys.flat());
	const yDomain: YRange = [yMin ?? auto[0], yMax ?? auto[1]];
	const spread = yDomain[1] - yDomain[0];
	const onChart = (y: number) =>
		Number.isFinite(y) && y >= yDomain[0] - spread && y <= yDomain[1] + spread;

	const rows = xs.map((x, index) => {
		const row: ChartRow = { x };
		ys.forEach((values, seriesIndex) => {
			const y = values[index]!;
			row[seriesKey(seriesIndex)] = onChart(y) ? y : null;
		});
		return row;
	});
	return { rows, yDomain };
}

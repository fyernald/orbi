import type {
	CompiledCurve,
	CompiledInteractive,
	FormulaScope,
	InteractiveChart,
} from '@orbi/shared';
import { seriesKey, shadeKey } from './chart-colors';
import type { ChartRow } from './chart-rows';
import { plotCurves, type FunctionPlot } from './function-plot';

// An interactive tool's chart at the controls' current values (US-42): its curves,
// the area shaded under some of them, and upright lines at given x.

export type ChartMarker = { label: string; x: number };

export type InteractivePlot = FunctionPlot & {
	// the curves that have a shaded area, by index
	shaded: number[];
	markers: ChartMarker[];
};

type Span = readonly [number, number];

const hasShade = (curve: CompiledCurve) =>
	curve.shadeFrom !== undefined || curve.shadeTo !== undefined;

// Where a curve is shaded now, kept inside the chart, or undefined when that is
// nowhere: shading up to a z left of the chart shades nothing.
export function shadeSpan(
	curve: CompiledCurve,
	scope: FormulaScope,
	[xMin, xMax]: Span
): Span | undefined {
	if (!hasShade(curve)) return undefined;
	const from = Math.max(xMin, curve.shadeFrom?.(scope) ?? xMin);
	const to = Math.min(xMax, curve.shadeTo?.(scope) ?? xMax);
	return Number.isFinite(from) && Number.isFinite(to) && from < to
		? [from, to]
		: undefined;
}

const within = (x: number, [from, to]: Span) => x >= from && x <= to;

function markersAt(
	compiled: CompiledInteractive,
	scope: FormulaScope,
	range: Span
): ChartMarker[] {
	return compiled.markers.flatMap(({ label, evaluate }) => {
		const x = evaluate(scope);
		return Number.isFinite(x) && within(x, range) ? [{ label, x }] : [];
	});
}

export function interactivePlot(
	compiled: CompiledInteractive,
	scope: FormulaScope,
	chart: Pick<InteractiveChart, 'xMin' | 'xMax' | 'yMin' | 'yMax'>,
	samples?: number
): InteractivePlot {
	const range: Span = [chart.xMin, chart.xMax];
	const spans = compiled.curves.map((curve) => shadeSpan(curve, scope, range));
	const plot = plotCurves(
		compiled.curves.map(
			({ evaluate }) =>
				(x: number) =>
					evaluate({ ...scope, x })
		),
		chart.xMin,
		chart.xMax,
		{
			yMin: chart.yMin,
			yMax: chart.yMax,
			samples,
			// the shading starts and stops exactly at its edges
			extraXs: spans.flatMap((span) => (span ? [...span] : [])),
		}
	);
	const shaded = compiled.curves.flatMap((curve, index) =>
		hasShade(curve) ? [index] : []
	);
	const rows = plot.rows.map((row) => {
		const shadedRow: ChartRow = { ...row };
		for (const index of shaded) {
			const span = spans[index];
			shadedRow[shadeKey(index)] =
				span && within(Number(row.x), span) ? row[seriesKey(index)]! : null;
		}
		return shadedRow;
	});
	return { ...plot, rows, shaded, markers: markersAt(compiled, scope, range) };
}

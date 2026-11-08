import { isCategoryChart, type CreateChartInput } from '@orbi/shared';
import { binLabel, binValues } from './chart-rows';

// a chart's numbers as rows, for screen readers and for copying
export type ChartTable = { columns: string[]; rows: (string | number)[][] };

// The table a chart is drawn from. A function plot has none: its formulas are the
// data, and the description says what the curve does.
export function chartTable(input: CreateChartInput): ChartTable | undefined {
	const { type, series } = input;
	if (isCategoryChart(type)) {
		const labels = input.labels ?? [];
		return {
			columns: [input.xLabel ?? 'Label', ...series.map(({ name }) => name)],
			rows: labels.map((label, index) => [
				label,
				...series.map(({ values }) => values?.[index] ?? ''),
			]),
		};
	}
	if (type === 'scatter') {
		return {
			columns: ['Series', input.xLabel ?? 'x', input.yLabel ?? 'y'],
			rows: series.flatMap(({ name, points = [] }) =>
				points.map(({ x, y }) => [name, x, y])
			),
		};
	}
	if (type === 'histogram') {
		const bins = binValues(series[0]?.values ?? [], input.bins);
		return {
			columns: [input.xLabel ?? 'Range', 'Count'],
			rows: bins.map((bin) => [binLabel(bin), bin.count]),
		};
	}
	return undefined;
}

const csvCell = (value: string | number) => {
	const text = String(value);
	return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export const toCsv = ({ columns, rows }: ChartTable) =>
	[columns, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');

// What "Copy data" copies: the formulas of a plot, the raw values of a histogram,
// or the table as CSV, which pastes into a spreadsheet.
export function chartSource(input: CreateChartInput): string {
	if (input.type === 'function') {
		const formulas = input.series.map(
			({ name, expression }) => `${name}: y = ${expression}`
		);
		return [...formulas, `x from ${input.xMin} to ${input.xMax}`].join('\n');
	}
	if (input.type === 'histogram') {
		const [series] = input.series;
		return toCsv({
			columns: [series?.name ?? 'Value'],
			rows: (series?.values ?? []).map((value) => [value]),
		});
	}
	const table = chartTable(input);
	return table ? toCsv(table) : '';
}

import { z } from 'zod';
import { compileFormula, FORMULA_MAX_LENGTH } from './formula';
import { visualDescription, visualTitle } from './visuals';

// What the createChart tool takes (US-42). The AI sends the numbers or formulas;
// the browser draws them with Orbi's chart colours. One flat object, checked by
// type below, is easier for every model to fill in than a union of shapes.

export const CHART_TYPES = [
	'bar',
	'line',
	'area',
	'pie',
	'scatter',
	'histogram',
	'function',
] as const;
export type ChartType = (typeof CHART_TYPES)[number];

// the types drawn from one value per label
export const CATEGORY_CHART_TYPES = ['bar', 'line', 'area', 'pie'] as const;
export type CategoryChartType = (typeof CATEGORY_CHART_TYPES)[number];

export const isCategoryChart = (type: ChartType): type is CategoryChartType =>
	(CATEGORY_CHART_TYPES as readonly string[]).includes(type);

// one colour each from --chart-1 to --chart-6
export const CHART_SERIES_MAX = 6;
export const CHART_LABELS_MAX = 30;
export const CHART_NAME_MAX_LENGTH = 40;
export const CHART_POINTS_MAX = 100;
export const CHART_SAMPLES_MAX = 300;
export const CHART_BINS_MIN = 3;
export const CHART_BINS_MAX = 30;
export const PIE_SLICES_MAX = 6;
export const CHART_FUNCTIONS_MAX = 4;

const chartName = z.string().trim().min(1).max(CHART_NAME_MAX_LENGTH);

const chartPoint = z.object({ x: z.number(), y: z.number() });

const chartSeries = z.object({
	name: chartName.describe('Shown in the legend and the tooltip.'),
	values: z
		.array(z.number())
		.max(CHART_SAMPLES_MAX)
		.optional()
		.describe(
			'bar, line, area, pie: one number per label. histogram: the raw values to count.'
		),
	points: z
		.array(chartPoint)
		.max(CHART_POINTS_MAX)
		.optional()
		.describe('scatter: the points.'),
	expression: z
		.string()
		.trim()
		.max(FORMULA_MAX_LENGTH)
		.optional()
		.describe(
			'function: y in terms of x, like sin(x) or exp(-x^2/2)/sqrt(2*pi).'
		),
});

const createChartFields = z.object({
	title: visualTitle,
	type: z.enum(CHART_TYPES),
	xLabel: chartName.optional().describe('The x axis name. Every type but pie.'),
	yLabel: chartName.optional().describe('The y axis name. Every type but pie.'),
	labels: z
		.array(chartName)
		.max(CHART_LABELS_MAX)
		.optional()
		.describe('bar, line, area, pie: the label of each value, in order.'),
	series: z.array(chartSeries).min(1).max(CHART_SERIES_MAX),
	bins: z
		.number()
		.int()
		.min(CHART_BINS_MIN)
		.max(CHART_BINS_MAX)
		.optional()
		.describe('histogram: how many bars. Left out, the app picks.'),
	xMin: z.number().optional().describe('function: where x starts.'),
	xMax: z.number().optional().describe('function: where x ends.'),
	yMin: z.number().optional().describe('function: the lowest y to show.'),
	yMax: z.number().optional().describe('function: the highest y to show.'),
	description: visualDescription,
});

type ChartFields = z.infer<typeof createChartFields>;
type ChartSeries = ChartFields['series'][number];

export type ChartProblem = { path: (string | number)[]; message: string };

const problem = (
	path: (string | number)[],
	message: string
): ChartProblem[] => [{ path, message }];

function categoryProblems(input: ChartFields): ChartProblem[] {
	const labels = input.labels ?? [];
	if (labels.length === 0) {
		return problem(['labels'], `A ${input.type} chart needs labels.`);
	}
	return input.series.flatMap((series, index) => {
		const count = series.values?.length ?? 0;
		return count === labels.length
			? []
			: problem(
					['series', index, 'values'],
					`Series "${series.name}" has ${count} values for ${labels.length} labels. Give one value per label.`
				);
	});
}

function pieProblems(input: ChartFields): ChartProblem[] {
	if (input.series.length !== 1) {
		return problem(['series'], 'A pie chart has exactly one series.');
	}
	if ((input.labels?.length ?? 0) > PIE_SLICES_MAX) {
		return problem(
			['labels'],
			`A pie chart has at most ${PIE_SLICES_MAX} slices. Put the smallest together as "Other".`
		);
	}
	const values = input.series[0]!.values ?? [];
	if (values.some((value) => value < 0) || !values.some((value) => value > 0)) {
		return problem(
			['series', 0, 'values'],
			'Pie values must be 0 or more, and at least one above 0.'
		);
	}
	return [];
}

function scatterProblems(input: ChartFields): ChartProblem[] {
	return input.series.flatMap((series, index) =>
		series.points?.length
			? []
			: problem(
					['series', index, 'points'],
					`Series "${series.name}" needs points.`
				)
	);
}

function histogramProblems(input: ChartFields): ChartProblem[] {
	if (input.series.length !== 1) {
		return problem(['series'], 'A histogram has exactly one series.');
	}
	return (input.series[0]!.values?.length ?? 0) < 2
		? problem(
				['series', 0, 'values'],
				'A histogram needs at least 2 values to count.'
			)
		: [];
}

function expressionProblems(series: ChartSeries, index: number) {
	if (!series.expression) {
		return problem(
			['series', index, 'expression'],
			`Series "${series.name}" needs an expression.`
		);
	}
	const formula = compileFormula(series.expression);
	return formula.ok
		? []
		: problem(['series', index, 'expression'], formula.problem);
}

function functionProblems(input: ChartFields): ChartProblem[] {
	if (input.series.length > CHART_FUNCTIONS_MAX) {
		return problem(
			['series'],
			`Plot at most ${CHART_FUNCTIONS_MAX} functions in one chart.`
		);
	}
	const { xMin, xMax, yMin, yMax } = input;
	const range =
		xMin === undefined || xMax === undefined || xMin >= xMax
			? problem(['xMax'], 'Give xMin and xMax, with xMin below xMax.')
			: [];
	const yRange =
		yMin !== undefined && yMax !== undefined && yMin >= yMax
			? problem(['yMax'], 'yMin must be below yMax.')
			: [];
	return [...range, ...yRange, ...input.series.flatMap(expressionProblems)];
}

const problemsByType: Record<
	ChartType,
	(input: ChartFields) => ChartProblem[]
> = {
	bar: categoryProblems,
	line: categoryProblems,
	area: categoryProblems,
	pie: (input) => [...categoryProblems(input), ...pieProblems(input)],
	scatter: scatterProblems,
	histogram: histogramProblems,
	function: functionProblems,
};

// What is wrong with a chart, in words the AI can fix in the same reply.
export function chartProblems(input: ChartFields): ChartProblem[] {
	const names = input.series.map(({ name }) => name);
	const sameName =
		new Set(names).size === names.length
			? []
			: problem(['series'], 'Give each series its own name.');
	const axes =
		input.type !== 'pie' && (!input.xLabel || !input.yLabel)
			? problem(['xLabel'], 'Name both axes with xLabel and yLabel.')
			: [];
	return [...sameName, ...axes, ...problemsByType[input.type](input)];
}

export const createChartInput = createChartFields.superRefine(
	(input, context) => {
		for (const { path, message } of chartProblems(input)) {
			context.addIssue({ code: 'custom', path, message });
		}
	}
);

// the chart is in the chat; the model writes its explanation next
export const createChartOutput = z.object({ shown: z.literal(true) });

export type CreateChartInput = z.infer<typeof createChartInput>;
export type CreateChartOutput = z.infer<typeof createChartOutput>;
export type ChartSeriesInput = CreateChartInput['series'][number];

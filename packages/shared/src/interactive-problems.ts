import type { ChartProblem } from './charts';
import { compileFormula, FORMULA_FUNCTION_NAMES } from './formula';
import type {
	InteractiveChart,
	InteractiveControl,
	InteractiveFields,
} from './interactive';
import {
	CONTROL_STEPS_MAX,
	isRangeControl,
	SELECT_OPTIONS_MIN,
} from './interactive-limits';
import {
	compileInteractive,
	CURVE_VARIABLE,
	startingValues,
	toolNames,
	workOutValues,
} from './interactive-scope';

// What is wrong with an interactive tool, in words the AI can fix in the same
// reply (US-42).

type Path = ChartProblem['path'];

const problem = (path: Path, message: string): ChartProblem[] => [
	{ path, message },
];

// names a formula already gives a meaning to
const TAKEN_NAMES = new Set([
	CURVE_VARIABLE,
	'pi',
	'e',
	...FORMULA_FUNCTION_NAMES,
]);

function nameProblems(input: InteractiveFields): ChartProblem[] {
	const names = toolNames(input);
	const taken = names.flatMap((name) =>
		TAKEN_NAMES.has(name)
			? problem(
					['controls'],
					`"${name}" already means something in formulas. Pick another name.`
				)
			: []
	);
	const repeated =
		new Set(names).size === names.length
			? []
			: problem(['controls'], 'Give each control and value its own name.');
	return [...taken, ...repeated];
}

function rangeProblems(item: InteractiveControl, path: Path): ChartProblem[] {
	const { min, max, step, value, label } = item;
	if (min === undefined || max === undefined || min >= max) {
		return problem(path, `"${label}" needs min and max, with min below max.`);
	}
	if (value < min || value > max) {
		return problem(path, `"${label}" must start between ${min} and ${max}.`);
	}
	if (step !== undefined && (max - min) / step > CONTROL_STEPS_MAX) {
		return problem(
			path,
			`"${label}" has more than ${CONTROL_STEPS_MAX} steps. Use a bigger step.`
		);
	}
	return [];
}

function controlProblems(item: InteractiveControl, index: number) {
	const path = ['controls', index];
	if (isRangeControl(item.type)) return rangeProblems(item, path);
	if (item.type === 'toggle') {
		return item.value === 0 || item.value === 1
			? []
			: problem(path, `Toggle "${item.label}" starts at 0 (off) or 1 (on).`);
	}
	const options = item.options ?? [];
	if (options.length < SELECT_OPTIONS_MIN) {
		return problem(
			path,
			`Select "${item.label}" needs at least ${SELECT_OPTIONS_MIN} options.`
		);
	}
	return options.some(({ value }) => value === item.value)
		? []
		: problem(path, `Select "${item.label}" must start at one option's value.`);
}

// a formula's problem, or none
function formulaProblems(
	source: string | undefined,
	variables: readonly string[],
	path: Path
): ChartProblem[] {
	if (source === undefined) return [];
	const formula = compileFormula(source, variables);
	return formula.ok ? [] : problem(path, formula.problem);
}

function valueProblems(input: InteractiveFields): ChartProblem[] {
	const controlNames = input.controls.map(({ name }) => name);
	const values = input.values ?? [];
	return values.flatMap(({ expression }, index) =>
		formulaProblems(
			expression,
			[...controlNames, ...values.slice(0, index).map(({ name }) => name)],
			['values', index, 'expression']
		)
	);
}

function chartProblems(chart: InteractiveChart, names: string[]) {
	const { xMin, xMax, yMin, yMax } = chart;
	const ranges = [
		...(xMin < xMax
			? []
			: problem(['chart', 'xMax'], 'xMin must be below xMax.')),
		...(yMin !== undefined && yMax !== undefined && yMin >= yMax
			? problem(['chart', 'yMax'], 'yMin must be below yMax.')
			: []),
	];
	const curves = chart.curves.flatMap((curve, index) => {
		const path = ['chart', 'curves', index];
		return [
			...formulaProblems(
				curve.expression,
				[CURVE_VARIABLE, ...names],
				[...path, 'expression']
			),
			...formulaProblems(curve.shadeFrom, names, [...path, 'shadeFrom']),
			...formulaProblems(curve.shadeTo, names, [...path, 'shadeTo']),
		];
	});
	const markers = (chart.markers ?? []).flatMap(({ x }, index) =>
		formulaProblems(x, names, ['chart', 'markers', index, 'x'])
	);
	return [...ranges, ...curves, ...markers];
}

// Every value must be a number when the tool starts, so the student never opens
// a tool that shows nothing.
function startingProblems(input: InteractiveFields): ChartProblem[] {
	const scope = workOutValues(compileInteractive(input), startingValues(input));
	return (input.values ?? []).flatMap(({ name, label }, index) =>
		Number.isFinite(scope[name])
			? []
			: problem(
					['values', index, 'expression'],
					`"${label}" is not a number at the starting values. Check the formula.`
				)
	);
}

export function interactiveProblems(input: InteractiveFields): ChartProblem[] {
	const shows =
		input.values?.length || input.chart
			? []
			: problem(['values'], 'Show some values, a chart, or both.');
	const found = [
		...shows,
		...nameProblems(input),
		...input.controls.flatMap(controlProblems),
		...valueProblems(input),
		...(input.chart ? chartProblems(input.chart, toolNames(input)) : []),
	];
	// the starting values can only be worked out once every formula reads
	return found.length > 0 ? found : startingProblems(input);
}

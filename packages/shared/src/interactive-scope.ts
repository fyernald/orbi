import { compileFormula, type Formula, type FormulaScope } from './formula';
import type { InteractiveChart, InteractiveFields } from './interactive';

// How an interactive tool's formulas are read and worked out (US-42). The server
// runs this to check a tool at its starting values, the browser on every change.

// the value of each control, by name
export type ControlValues = Readonly<Record<string, number>>;

// the variable a curve is drawn along
export const CURVE_VARIABLE = 'x';

export type CompiledCurve = {
	evaluate: Formula;
	shadeFrom?: Formula;
	shadeTo?: Formula;
};

export type CompiledInteractive = {
	values: { name: string; evaluate: Formula }[];
	curves: CompiledCurve[];
	markers: { label: string; evaluate: Formula }[];
};

type ToolParts = Pick<InteractiveFields, 'controls' | 'values' | 'chart'>;

// every name the tool's formulas may use besides x: the controls, then the values
export const toolNames = ({ controls, values = [] }: ToolParts) => [
	...controls.map(({ name }) => name),
	...values.map(({ name }) => name),
];

export const startingValues = ({ controls }: ToolParts): ControlValues =>
	Object.fromEntries(controls.map(({ name, value }) => [name, value]));

function compileOrThrow(source: string, variables: readonly string[]) {
	const formula = compileFormula(source, variables);
	if (!formula.ok) throw new Error(formula.problem);
	return formula.evaluate;
}

const optional = (source: string | undefined, variables: readonly string[]) =>
	source === undefined ? undefined : compileOrThrow(source, variables);

function compileChart(chart: InteractiveChart | undefined, names: string[]) {
	if (!chart) return { curves: [], markers: [] };
	const curves = chart.curves.map((curve) => ({
		evaluate: compileOrThrow(curve.expression, [CURVE_VARIABLE, ...names]),
		shadeFrom: optional(curve.shadeFrom, names),
		shadeTo: optional(curve.shadeTo, names),
	}));
	const markers = (chart.markers ?? []).map(({ label, x }) => ({
		label,
		evaluate: compileOrThrow(x, names),
	}));
	return { curves, markers };
}

// Every formula of a checked tool, read once. A value may use the controls and
// the values above it; a curve also uses x.
export function compileInteractive(tool: ToolParts): CompiledInteractive {
	const controlNames = tool.controls.map(({ name }) => name);
	const values = (tool.values ?? []).map(({ name, expression }, index) => ({
		name,
		evaluate: compileOrThrow(expression, [
			...controlNames,
			...(tool.values ?? []).slice(0, index).map((value) => value.name),
		]),
	}));
	return { values, ...compileChart(tool.chart, toolNames(tool)) };
}

// The controls with every value worked out from them, in order, for the curves
// and the results to read.
export function workOutValues(
	compiled: CompiledInteractive,
	controls: ControlValues
): FormulaScope {
	const scope: Record<string, number> = { ...controls };
	for (const { name, evaluate } of compiled.values) {
		scope[name] = evaluate(scope);
	}
	return scope;
}

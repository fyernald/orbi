// Canvas libraries cannot read CSS variables, but a model often hands them one,
// like backgroundColor: 'var(--orbi-chart-1)'. These turn such values into the
// colour itself, using lookup to read the variable.

const ORBI_VARIABLE = /^\s*var\(\s*(--orbi-[\w-]+)\s*\)\s*$/;

export type VariableLookup = (name: string) => string;

// the value with each Orbi variable in it resolved; the same value when it has none
export function resolveColor(value: unknown, lookup: VariableLookup): unknown {
	if (typeof value === 'string') {
		const name = ORBI_VARIABLE.exec(value)?.[1];
		return name ? lookup(name) || value : value;
	}
	if (Array.isArray(value)) {
		const resolved = value.map((item) => resolveColor(item, lookup));
		return resolved.some((item, index) => item !== value[index])
			? resolved
			: value;
	}
	return value;
}

// the colour options of a Chart.js dataset
export const CHART_COLOR_KEYS = [
	'backgroundColor',
	'borderColor',
	'pointBackgroundColor',
	'pointBorderColor',
	'hoverBackgroundColor',
	'hoverBorderColor',
] as const;

type Remembered = { original: unknown; resolved: unknown };

// what each dataset's colours were before they were resolved
export type ColorMemory = WeakMap<object, Map<string, Remembered>>;

// Resolves a dataset's colours in place. The variable it was given is remembered,
// so a theme switch resolves it again; a colour the mini-app set since is its own.
export function resolveDatasetColors(
	dataset: Record<string, unknown>,
	lookup: VariableLookup,
	memory: ColorMemory
) {
	const remembered = memory.get(dataset) ?? new Map<string, Remembered>();
	memory.set(dataset, remembered);
	for (const key of CHART_COLOR_KEYS) {
		if (!(key in dataset)) continue;
		const value = dataset[key];
		const last = remembered.get(key);
		const original = last && value === last.resolved ? last.original : value;
		const resolved = resolveColor(original, lookup);
		dataset[key] = resolved;
		if (resolved === original) remembered.delete(key);
		else remembered.set(key, { original, resolved });
	}
}

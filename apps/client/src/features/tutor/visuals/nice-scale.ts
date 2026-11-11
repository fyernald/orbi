// An axis range with round steps between its numbers (0, 10, 20…), so a reader
// can tell a value from the grid without working out the step.

export type Range = [number, number];

export type Scale = { domain: Range; ticks: number[] };

// about this many steps along a value axis
export const VALUE_STEPS = 5;

// Drops the float noise of stepping (0.1 * 3 = 0.30000000000000004) and turns -0
// into 0, so the numbers print as written.
const tidy = (value: number) => Number(value.toPrecision(12)) + 0;

// a round step near `raw`: 1, 2, 2.5 or 5 times a power of ten
export function niceStep(raw: number): number {
	const power = 10 ** Math.floor(Math.log10(raw));
	const step = [1, 2, 2.5, 5, 10].find((factor) => factor * power >= raw);
	return tidy((step ?? 10) * power);
}

// every multiple of `step` from `from` to `to`
function multiplesBetween(from: number, to: number, step: number): number[] {
	const first = Math.ceil(tidy(from / step));
	const last = Math.floor(tidy(to / step));
	return Array.from({ length: last - first + 1 }, (_, index) =>
		tidy((first + index) * step)
	);
}

// a range with some width: a flat line still needs room above and below
function widen(min: number, max: number): Range {
	if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
	if (min !== max) return [min, max];
	if (min === 0) return [0, 1];
	const room = Math.abs(min) / 2;
	return [min - room, max + room];
}

type ScaleOptions = { steps?: number; wholeNumbers?: boolean };

// The range from `min` to `max` stretched out to round numbers, with its ticks:
// values up to 36 get 0, 10, 20, 30, 40. Counts (`wholeNumbers`) never step by
// halves.
export function niceScale(
	min: number,
	max: number,
	{ steps = VALUE_STEPS, wholeNumbers = false }: ScaleOptions = {}
): Scale {
	const [low, high] = widen(min, max);
	const raw = niceStep((high - low) / steps);
	const step = wholeNumbers ? Math.max(raw, 1) : raw;
	const domain: Range = [
		tidy(Math.floor(tidy(low / step)) * step),
		tidy(Math.ceil(tidy(high / step)) * step),
	];
	return { domain, ticks: multiplesBetween(domain[0], domain[1], step) };
}

// Round ticks inside a range that must stay as it is, like the x range of a
// function plot: -3 to 3 gets -3, -2, … 3, so 0 is always marked when it is in it.
export function ticksWithin(
	min: number,
	max: number,
	steps = VALUE_STEPS
): number[] {
	if (!(max > min)) return [min];
	return multiplesBetween(min, max, niceStep((max - min) / steps));
}

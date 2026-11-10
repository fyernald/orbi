// Statistics functions for formulas (US-42), like the normal curve of a z-score
// tool. Plain maths, so the server and the browser get the same numbers.

// Abramowitz and Stegun 7.1.26: within 1.5e-7 of the real error function, far
// finer than the 4 decimals a probability is shown with.
const ERF_P = 0.3275911;
const ERF_A = [
	0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429,
];

export function erf(x: number): number {
	const sign = Math.sign(x);
	const z = Math.abs(x);
	const t = 1 / (1 + ERF_P * z);
	const polynomial = ERF_A.reduceRight((sum, a) => sum * t + a, 0) * t;
	return sign * (1 - polynomial * Math.exp(-z * z));
}

// the height of the normal curve at x
export function normalPdf(x: number, mean = 0, sd = 1): number {
	const z = (x - mean) / sd;
	return Math.exp(-(z * z) / 2) / (sd * Math.sqrt(2 * Math.PI));
}

// the share of the normal curve to the left of x
export function normalCdf(x: number, mean = 0, sd = 1): number {
	return 0.5 * (1 + erf((x - mean) / (sd * Math.SQRT2)));
}

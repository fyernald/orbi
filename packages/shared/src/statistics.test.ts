import { describe, expect, it } from 'vitest';
import { compileFormula } from './formula';
import { erf, normalCdf, normalPdf } from './statistics';

describe('erf', () => {
	it('matches known values and is odd', () => {
		expect(erf(0)).toBeCloseTo(0, 6);
		expect(erf(1)).toBeCloseTo(0.842701, 6);
		expect(erf(-1)).toBeCloseTo(-0.842701, 6);
		expect(erf(3)).toBeCloseTo(0.999978, 6);
	});
});

describe('the normal curve', () => {
	it('gives the shares a z table gives', () => {
		expect(normalCdf(0)).toBeCloseTo(0.5, 6);
		expect(normalCdf(1.96)).toBeCloseTo(0.975, 4);
		expect(normalCdf(-1)).toBeCloseTo(0.1587, 4);
		expect(normalCdf(110, 100, 10)).toBeCloseTo(0.8413, 4);
	});

	it('peaks at the mean', () => {
		expect(normalPdf(0)).toBeCloseTo(0.398942, 6);
		expect(normalPdf(100, 100, 10)).toBeCloseTo(0.0398942, 6);
		expect(normalPdf(1)).toBeCloseTo(normalPdf(-1), 12);
	});

	it('can be written in formulas', () => {
		const formula = compileFormula('normcdf(z) - normcdf(-z)', ['z']);
		if (!formula.ok) throw new Error(formula.problem);
		expect(formula.evaluate({ z: 1 })).toBeCloseTo(0.6827, 4);
		expect(compileFormula('normpdf(x, 0, 1, 2)').ok).toBe(false);
	});
});

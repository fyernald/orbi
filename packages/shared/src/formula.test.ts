import { describe, expect, it } from 'vitest';
import { compileFormula } from './formula';

const valueOf = (source: string, x = 0, variables?: string[]) => {
	const formula = compileFormula(source, variables);
	if (!formula.ok) throw new Error(formula.problem);
	return formula.evaluate({ x });
};

const problemOf = (source: string) => {
	const formula = compileFormula(source);
	return formula.ok ? undefined : formula.problem;
};

describe('compileFormula', () => {
	it('works out the usual order of operations', () => {
		expect(valueOf('1 + 2 * 3')).toBe(7);
		expect(valueOf('(1 + 2) * 3')).toBe(9);
		expect(valueOf('2 ^ 3 ^ 2')).toBe(512);
		expect(valueOf('2 ** 3')).toBe(8);
		expect(valueOf('10 - 4 - 3')).toBe(3);
		expect(valueOf('12 / 3 / 2')).toBe(2);
	});

	it('takes minus signs the way maths does', () => {
		expect(valueOf('-x^2', 3)).toBe(-9);
		expect(valueOf('2^-1')).toBe(0.5);
		expect(valueOf('--x', 2)).toBe(2);
		expect(valueOf('3 - -x', 2)).toBe(5);
	});

	it('reads a missing * as a multiplication', () => {
		expect(valueOf('2x', 4)).toBe(8);
		expect(valueOf('2x^2', 3)).toBe(18);
		expect(valueOf('x(x + 1)', 3)).toBe(12);
		expect(valueOf('(x + 1)(x - 1)', 3)).toBe(8);
		expect(valueOf('2pi')).toBeCloseTo(2 * Math.PI);
	});

	it('knows maths functions and constants', () => {
		expect(valueOf('sin(pi / 2)')).toBeCloseTo(1);
		expect(valueOf('exp(-x^2/2)/sqrt(2*pi)', 0)).toBeCloseTo(0.398942);
		expect(valueOf('ln(e)')).toBe(1);
		expect(valueOf('max(1, x, 3)', 5)).toBe(5);
		expect(valueOf('1.5e3')).toBe(1500);
	});

	it('uses the variables it is given', () => {
		const formula = compileFormula('a * z + b', ['a', 'b', 'z']);

		expect(formula.ok && formula.evaluate({ a: 2, b: 1, z: 3 })).toBe(7);
		expect(problemOf('a * x')).toContain('Unknown name "a"');
	});

	it('names the problem so the AI can fix it', () => {
		expect(problemOf('')).toBe('The formula is empty.');
		expect(problemOf('x²')).toContain('"²" cannot be used');
		expect(problemOf('sin x')).toBe('Write sin(…) with brackets.');
		expect(problemOf('foo(x)')).toContain('Unknown function "foo"');
		expect(problemOf('sqrt(1, 2)')).toBe('sqrt takes 1 values.');
		expect(problemOf('(x + 1')).toBe('Close every bracket you open.');
		expect(problemOf('x +')).toBe('The formula ends too early.');
		expect(problemOf('x )')).toBe('")" is in the wrong place.');
		expect(problemOf('x'.repeat(201))).toContain('under 200 characters');
	});

	it('cannot reach anything but maths', () => {
		expect(problemOf('constructor')).toContain('Unknown name');
		expect(problemOf('toString(x)')).toContain('Unknown function');
		expect(problemOf('__proto__')).toContain('Unknown name');
		expect(problemOf('alert("hi")')).toContain('cannot be used');
	});
});

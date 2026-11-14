import { describe, expect, it } from 'vitest';
import { curveRange, plotFunctions } from './function-plot';

describe('plotFunctions', () => {
	it('works out each formula across the x range', () => {
		const plot = plotFunctions(
			[
				{ name: 'Square', expression: 'x^2' },
				{ name: 'Line', expression: '2x + 1' },
			],
			-2,
			2,
			undefined,
			undefined,
			5
		);

		expect(plot.rows).toEqual([
			{ x: -2, s0: 4, s1: -3 },
			{ x: -1, s0: 1, s1: -1 },
			{ x: 0, s0: 0, s1: 1 },
			{ x: 1, s0: 1, s1: 3 },
			{ x: 2, s0: 4, s1: 5 },
		]);
		expect(plot.yDomain).toEqual([-4, 6]);
		expect(plot.yTicks).toEqual([-4, -2, 0, 2, 4, 6]);
	});

	it('shows the normal curve at its height', () => {
		const plot = plotFunctions(
			[{ name: 'Normal', expression: 'exp(-x^2/2)/sqrt(2*pi)' }],
			-3,
			3
		);

		expect(plot.yDomain).toEqual([0, 0.4]);
		expect(plot.yTicks).toEqual([0, 0.1, 0.2, 0.3, 0.4]);
	});

	it('leaves gaps where a formula has no value or runs off the chart', () => {
		const plot = plotFunctions(
			[{ name: 'Root', expression: 'sqrt(x)' }],
			-1,
			1,
			undefined,
			undefined,
			3
		);
		const tangent = plotFunctions(
			[{ name: 'Tangent', expression: 'tan(x)' }],
			-3,
			3
		);

		expect(plot.rows[0]).toEqual({ x: -1, s0: null });
		// tan(x) jumps to huge values near pi/2; the range keeps to the curve
		expect(tangent.yDomain[1]).toBeLessThan(100);
		expect(tangent.rows.some((row) => row.s0 === null)).toBe(true);
	});

	it('keeps a y range the AI gave', () => {
		const plot = plotFunctions(
			[{ name: 'Cube', expression: 'x^3' }],
			-3,
			3,
			-5,
			5
		);

		expect(plot.yDomain).toEqual([-5, 5]);
		expect(plot.yTicks).toEqual([-4, -2, 0, 2, 4]);
	});
});

describe('curveRange', () => {
	it('gives a flat line some room', () => {
		expect(curveRange([2, 2, 2])).toEqual([1, 3]);
		expect(curveRange([Number.NaN])).toEqual([-1, 1]);
	});
});

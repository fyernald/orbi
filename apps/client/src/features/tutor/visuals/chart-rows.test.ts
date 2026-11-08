import { describe, expect, it } from 'vitest';
import { binValues, categoryRows, histogramRows, niceStep } from './chart-rows';

describe('categoryRows', () => {
	it('gives each label the value of every series', () => {
		expect(
			categoryRows(
				['Maths', 'Biology'],
				[
					{ name: '2025', values: [70, 82] },
					{ name: '2026', values: [75] },
				]
			)
		).toEqual([
			{ label: 'Maths', s0: 70, s1: 75 },
			{ label: 'Biology', s0: 82, s1: null },
		]);
	});
});

describe('binValues', () => {
	it('rounds the bar width', () => {
		expect(niceStep(7.3)).toBe(10);
		expect(niceStep(0.18)).toBe(0.2);
		expect(niceStep(2.2)).toBe(2.5);
		expect(niceStep(40)).toBe(50);
	});

	it('counts every value into bars of the same round width', () => {
		const bins = binValues([52, 58, 61, 67, 70, 74, 79, 88, 90], 4);

		expect(bins.map(({ from, to }) => [from, to])).toEqual([
			[50, 60],
			[60, 70],
			[70, 80],
			[80, 90],
		]);
		expect(bins.map(({ count }) => count)).toEqual([2, 2, 3, 2]);
		expect(bins.reduce((sum, { count }) => sum + count, 0)).toBe(9);
	});

	it('picks a number of bars when none is given', () => {
		const values = Array.from({ length: 100 }, (_, index) => index);

		expect(binValues(values).length).toBeGreaterThanOrEqual(5);
		expect(binValues(values).length).toBeLessThanOrEqual(12);
	});

	it('puts equal values in one bar', () => {
		expect(binValues([3, 3, 3])).toEqual([{ from: 3, to: 3, count: 3 }]);
	});

	it('labels each bar with its range', () => {
		expect(histogramRows([{ from: 50, to: 60, count: 2 }])).toEqual([
			{ label: '50–60', s0: 2 },
		]);
	});
});

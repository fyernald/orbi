import { describe, expect, it } from 'vitest';
import {
	binValues,
	categoryRows,
	histogramRows,
	pointScales,
	valueExtent,
	valueScale,
} from './chart-rows';

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

describe('valueExtent', () => {
	it('finds the lowest and highest value of every series', () => {
		expect(
			valueExtent(
				[
					{ label: 'A', s0: 4, s1: -2 },
					{ label: 'B', s0: null, s1: 9 },
				],
				2
			)
		).toEqual([-2, 9]);
		expect(valueExtent([{ label: 'A', s0: null }], 1)).toBeUndefined();
	});
});

describe('valueScale', () => {
	it('starts at 0 and steps up in round numbers', () => {
		const rows = [
			{ label: 'Prophase', s0: 36 },
			{ label: 'Metaphase', s0: 20 },
		];

		expect(valueScale(rows, 1).ticks).toEqual([0, 10, 20, 30, 40]);
		expect(
			valueScale([{ label: 'A', s0: 2 }], 1, { wholeNumbers: true }).ticks
		).toEqual([0, 1, 2]);
	});

	it('fits lines around their values', () => {
		const rows = [
			{ label: '2023', s0: 158, s1: 162 },
			{ label: '2026', s0: 166, s1: 171 },
		];

		expect(valueScale(rows, 2, { fromZero: false }).domain).toEqual([155, 175]);
		expect(valueScale(rows, 2).domain[0]).toBe(0);
	});
});

describe('pointScales', () => {
	it('fits both axes around the points', () => {
		const scales = pointScales([
			{
				name: 'Class A',
				points: [
					{ x: 2, y: 55 },
					{ x: 9, y: 91 },
				],
			},
		]);

		expect(scales.x.ticks).toEqual([2, 4, 6, 8, 10]);
		expect(scales.y.ticks).toEqual([50, 60, 70, 80, 90, 100]);
	});
});

describe('binValues', () => {
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

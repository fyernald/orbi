import { describe, expect, it } from 'vitest';
import { createChartInput } from './charts';

const bar = {
	title: 'Marks by subject',
	type: 'bar',
	xLabel: 'Subject',
	yLabel: 'Mark',
	labels: ['Maths', 'Biology', 'History'],
	series: [
		{ name: '2025', values: [70, 82, 64] },
		{ name: '2026', values: [75, 80, 71] },
	],
	description: 'Marks in three subjects for two years.',
};

const messagesOf = (input: unknown) => {
	const result = createChartInput.safeParse(input);
	return result.success
		? []
		: result.error.issues.map(({ message }) => message);
};

describe('createChartInput', () => {
	it('takes a chart of each type', () => {
		const charts = [
			bar,
			{ ...bar, type: 'line' },
			{
				...bar,
				type: 'pie',
				xLabel: undefined,
				yLabel: undefined,
				series: [{ name: 'Share', values: [1, 2, 0] }],
			},
			{
				...bar,
				type: 'scatter',
				labels: undefined,
				series: [{ name: 'Students', points: [{ x: 1, y: 2 }] }],
			},
			{
				...bar,
				type: 'histogram',
				labels: undefined,
				series: [{ name: 'Marks', values: [55, 61, 70, 72, 90] }],
				bins: 5,
			},
			{
				...bar,
				type: 'function',
				labels: undefined,
				series: [{ name: 'Sine', expression: 'sin(x)' }],
				xMin: -6,
				xMax: 6,
			},
		];

		for (const chart of charts) expect(messagesOf(chart)).toEqual([]);
	});

	it('needs one value per label', () => {
		expect(
			messagesOf({ ...bar, series: [{ name: '2025', values: [70, 82] }] })
		).toEqual([
			'Series "2025" has 2 values for 3 labels. Give one value per label.',
		]);
		expect(messagesOf({ ...bar, labels: [] })).toEqual([
			'A bar chart needs labels.',
		]);
	});

	it('needs named axes and series names that differ', () => {
		expect(messagesOf({ ...bar, yLabel: undefined })).toEqual([
			'Name both axes with xLabel and yLabel.',
		]);
		expect(
			messagesOf({
				...bar,
				series: [
					{ name: 'A', values: [1, 2, 3] },
					{ name: 'A', values: [1, 2, 3] },
				],
			})
		).toEqual(['Give each series its own name.']);
	});

	it('keeps a pie chart to one series of positive shares', () => {
		const pie = { ...bar, type: 'pie' };

		expect(messagesOf(pie)).toEqual(['A pie chart has exactly one series.']);
		expect(
			messagesOf({ ...pie, series: [{ name: 'Share', values: [1, -1, 2] }] })
		).toEqual(['Pie values must be 0 or more, and at least one above 0.']);
		expect(
			messagesOf({
				...pie,
				labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
				series: [{ name: 'Share', values: [1, 1, 1, 1, 1, 1, 1] }],
			})
		).toContain(
			'A pie chart has at most 6 slices. Put the smallest together as "Other".'
		);
	});

	it('checks the formulas and the range of a function plot', () => {
		const plot = {
			...bar,
			type: 'function',
			labels: undefined,
			series: [{ name: 'Curve', expression: 'x²' }],
			xMin: 3,
			xMax: 1,
		};

		expect(messagesOf(plot)).toEqual([
			'Give xMin and xMax, with xMin below xMax.',
			expect.stringContaining('"²" cannot be used'),
		]);
	});

	it('refuses too much data', () => {
		expect(
			messagesOf({
				...bar,
				labels: Array.from({ length: 31 }, (_, index) => `L${index}`),
				series: [{ name: 'A', values: Array(31).fill(1) }],
			})
		).not.toEqual([]);
		expect(
			messagesOf({
				...bar,
				series: Array.from({ length: 7 }, (_, index) => ({
					name: `S${index}`,
					values: [1, 2, 3],
				})),
			})
		).not.toEqual([]);
	});
});

import type { CreateChartInput } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { chartSource, chartTable, toCsv } from './chart-table';

const bar: CreateChartInput = {
	title: 'Marks by subject',
	type: 'bar',
	xLabel: 'Subject',
	yLabel: 'Mark',
	labels: ['Maths', 'Biology, cells'],
	series: [
		{ name: '2025', values: [70, 82] },
		{ name: '2026', values: [75, 80] },
	],
	description: 'Marks in two subjects for two years.',
};

describe('chartTable', () => {
	it('gives a row per label with every series', () => {
		expect(chartTable(bar)).toEqual({
			columns: ['Subject', '2025', '2026'],
			rows: [
				['Maths', 70, 75],
				['Biology, cells', 82, 80],
			],
		});
	});

	it('gives a row per point of a scatter plot', () => {
		const scatter: CreateChartInput = {
			...bar,
			type: 'scatter',
			xLabel: 'Hours',
			yLabel: 'Mark',
			series: [{ name: 'Class A', points: [{ x: 2, y: 60 }] }],
		};

		expect(chartTable(scatter)).toEqual({
			columns: ['Series', 'Hours', 'Mark'],
			rows: [['Class A', 2, 60]],
		});
	});

	it('gives the bars of a histogram and nothing for a plot', () => {
		const histogram: CreateChartInput = {
			...bar,
			type: 'histogram',
			series: [{ name: 'Marks', values: [52, 58, 61, 67] }],
			bins: 2,
		};

		expect(chartTable(histogram)?.rows).toEqual([
			['50–60', 2],
			['60–70', 2],
		]);
		expect(chartTable({ ...bar, type: 'function' })).toBeUndefined();
	});
});

describe('chartSource', () => {
	it('copies the table as CSV, quoting cells with commas', () => {
		expect(chartSource(bar)).toBe(
			'Subject,2025,2026\nMaths,70,75\n"Biology, cells",82,80'
		);
		expect(toCsv({ columns: ['Say "hi"'], rows: [] })).toBe('"Say ""hi"""');
	});

	it('copies the formulas of a plot and the raw values of a histogram', () => {
		expect(
			chartSource({
				...bar,
				type: 'function',
				series: [{ name: 'Sine', expression: 'sin(x)' }],
				xMin: -3,
				xMax: 3,
			})
		).toBe('Sine: y = sin(x)\nx from -3 to 3');
		expect(
			chartSource({
				...bar,
				type: 'histogram',
				series: [{ name: 'Marks', values: [52, 58] }],
			})
		).toBe('Marks\n52\n58');
	});
});

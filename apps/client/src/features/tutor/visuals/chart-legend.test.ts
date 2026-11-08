import type { CreateChartInput } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { chartConfig, legendEntries, legendNames } from './chart-legend';

const bar: CreateChartInput = {
	title: 'Marks',
	type: 'bar',
	xLabel: 'Subject',
	yLabel: 'Mark',
	labels: ['Maths', 'Biology'],
	series: [{ name: '2025', values: [70, 82] }],
	description: 'Marks in two subjects.',
};

describe('legendEntries', () => {
	it('names no series when there is only one', () => {
		expect(legendEntries(bar)).toEqual([]);
	});

	it('names each series when there are more', () => {
		const twoYears = {
			...bar,
			series: [...bar.series, { name: '2026', values: [75, 80] }],
		};

		expect(legendEntries(twoYears)).toEqual([
			{ name: '2025' },
			{ name: '2026' },
		]);
	});

	it('gives each pie slice its share', () => {
		const pie: CreateChartInput = {
			...bar,
			type: 'pie',
			labels: ['Water', 'Protein', 'Fat'],
			series: [{ name: 'Body', values: [60, 30, 10] }],
		};

		expect(legendNames(pie)).toEqual(['Water 60%', 'Protein 30%', 'Fat 10%']);
	});
});

describe('chartConfig', () => {
	it('gives each series the next chart colour', () => {
		const config = chartConfig({
			...bar,
			series: [
				{ name: 'A', values: [1, 2] },
				{ name: 'B', values: [3, 4] },
			],
		});

		expect(config).toEqual({
			s0: { label: 'A', color: 'var(--chart-1)' },
			s1: { label: 'B', color: 'var(--chart-2)' },
		});
	});
});

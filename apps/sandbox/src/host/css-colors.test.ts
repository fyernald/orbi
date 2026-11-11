import { describe, expect, it } from 'vitest';
import {
	resolveColor,
	resolveDatasetColors,
	type ColorMemory,
} from './css-colors';

const light: Record<string, string> = {
	'--orbi-chart-1': '#c61d78',
	'--orbi-chart-2': '#2563eb',
};
const dark: Record<string, string> = {
	'--orbi-chart-1': '#e0559c',
	'--orbi-chart-2': '#60a5fa',
};
const lookupIn = (theme: Record<string, string>) => (name: string) =>
	theme[name] ?? '';

describe('resolveColor', () => {
	const lookup = lookupIn(light);

	it('turns an Orbi variable into the colour', () => {
		expect(resolveColor('var(--orbi-chart-1)', lookup)).toBe('#c61d78');
		expect(resolveColor(' var( --orbi-chart-2 ) ', lookup)).toBe('#2563eb');
	});

	it('resolves each colour of a list, and keeps a list with none', () => {
		expect(resolveColor(['var(--orbi-chart-1)', '#000000'], lookup)).toEqual([
			'#c61d78',
			'#000000',
		]);
		const plain = ['#000000'];
		expect(resolveColor(plain, lookup)).toBe(plain);
	});

	it('leaves other values alone', () => {
		expect(resolveColor('#ffffff', lookup)).toBe('#ffffff');
		expect(resolveColor('var(--other)', lookup)).toBe('var(--other)');
		expect(resolveColor('var(--orbi-unknown)', lookup)).toBe(
			'var(--orbi-unknown)'
		);
		expect(resolveColor(3, lookup)).toBe(3);
	});
});

describe('resolveDatasetColors', () => {
	it('fixes the colour options of a Chart.js dataset in place', () => {
		const dataset: Record<string, unknown> = {
			data: [1, 2],
			backgroundColor: 'var(--orbi-chart-1)',
			borderColor: ['var(--orbi-chart-2)'],
		};

		resolveDatasetColors(dataset, lookupIn(light), new WeakMap());

		expect(dataset).toEqual({
			data: [1, 2],
			backgroundColor: '#c61d78',
			borderColor: ['#2563eb'],
		});
	});

	it('resolves the variable again after a theme switch', () => {
		const memory: ColorMemory = new WeakMap();
		const dataset: Record<string, unknown> = {
			backgroundColor: 'var(--orbi-chart-1)',
		};

		resolveDatasetColors(dataset, lookupIn(light), memory);
		resolveDatasetColors(dataset, lookupIn(dark), memory);

		expect(dataset.backgroundColor).toBe('#e0559c');
	});

	it('keeps a colour the mini-app set itself since', () => {
		const memory: ColorMemory = new WeakMap();
		const dataset: Record<string, unknown> = {
			backgroundColor: 'var(--orbi-chart-1)',
		};

		resolveDatasetColors(dataset, lookupIn(light), memory);
		dataset.backgroundColor = '#ffaa00';
		resolveDatasetColors(dataset, lookupIn(dark), memory);

		expect(dataset.backgroundColor).toBe('#ffaa00');
	});
});

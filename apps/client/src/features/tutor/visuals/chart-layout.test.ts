import { describe, expect, it } from 'vitest';
import {
	barRowsHeight,
	fitLabel,
	labelColumnWidth,
	labelsFitAcross,
	numberAxisSteps,
} from './chart-layout';

const phases = [
	'Prophase',
	'Prometaphase',
	'Metaphase',
	'Anaphase',
	'Telophase',
];

describe('labelsFitAcross', () => {
	it('fits the phases of mitosis on a wide chart but not on a phone', () => {
		expect(labelsFitAcross(phases, 640)).toBe(true);
		expect(labelsFitAcross(phases, 320)).toBe(false);
	});

	it('fits short labels on a phone', () => {
		expect(labelsFitAcross(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], 320)).toBe(
			true
		);
		expect(labelsFitAcross([], 100)).toBe(true);
	});
});

describe('numberAxisSteps', () => {
	it('marks fewer steps on a narrow chart', () => {
		expect(numberAxisSteps(640)).toBe(6);
		expect(numberAxisSteps(246)).toBe(4);
		expect(numberAxisSteps(0)).toBe(2);
	});
});

describe('labelColumnWidth', () => {
	it('is as wide as the longest name, up to 40% of the chart', () => {
		expect(labelColumnWidth(phases, 320)).toBe(92);
		expect(labelColumnWidth(['A very long name for one bar'], 320)).toBe(128);
	});
});

describe('fitLabel', () => {
	it('cuts a name that does not fit with an ellipsis', () => {
		expect(fitLabel('Prophase', 92)).toBe('Prophase');
		expect(fitLabel('A very long name for one bar', 70)).toBe('A very lo…');
	});
});

describe('barRowsHeight', () => {
	it('gives each label a row with room for every series', () => {
		expect(barRowsHeight(5, 1)).toBe(238);
		expect(barRowsHeight(5, 3)).toBe(78 + 5 * 52);
	});
});

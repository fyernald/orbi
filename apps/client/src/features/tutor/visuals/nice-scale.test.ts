import { describe, expect, it } from 'vitest';
import { niceScale, niceStep, ticksWithin } from './nice-scale';

describe('niceStep', () => {
	it('rounds a step to 1, 2, 2.5 or 5 times a power of ten', () => {
		expect(niceStep(7.3)).toBe(10);
		expect(niceStep(0.18)).toBe(0.2);
		expect(niceStep(2.2)).toBe(2.5);
		expect(niceStep(40)).toBe(50);
		expect(niceStep(0.3)).toBe(0.5);
	});
});

describe('niceScale', () => {
	it('stretches the range to round numbers with even steps', () => {
		expect(niceScale(0, 36)).toEqual({
			domain: [0, 40],
			ticks: [0, 10, 20, 30, 40],
		});
		expect(niceScale(0, 28).ticks).toEqual([0, 10, 20, 30]);
		expect(niceScale(-3, 5).ticks).toEqual([-4, -2, 0, 2, 4, 6]);
	});

	it('prints small steps without float noise', () => {
		expect(niceScale(0.0044, 0.3989).ticks).toEqual([0, 0.1, 0.2, 0.3, 0.4]);
		expect(niceScale(-0.3, 0.2).ticks).toEqual([-0.3, -0.2, -0.1, 0, 0.1, 0.2]);
	});

	it('steps counts by whole numbers', () => {
		expect(niceScale(0, 2).ticks).toEqual([0, 0.5, 1, 1.5, 2]);
		expect(niceScale(0, 2, { wholeNumbers: true }).ticks).toEqual([0, 1, 2]);
	});

	it('gives a flat or empty range some room', () => {
		expect(niceScale(0, 0).domain).toEqual([0, 1]);
		expect(niceScale(4, 4).domain).toEqual([2, 6]);
		expect(niceScale(Number.NaN, 1).domain).toEqual([0, 1]);
	});
});

describe('ticksWithin', () => {
	it('marks round numbers inside a fixed range, 0 among them', () => {
		expect(ticksWithin(-3, 3, 6)).toEqual([-3, -2, -1, 0, 1, 2, 3]);
		expect(ticksWithin(0, 2 * Math.PI, 6)).toEqual([0, 2, 4, 6]);
		expect(ticksWithin(-10, 10)).toEqual([-10, -5, 0, 5, 10]);
		expect(ticksWithin(1, 1)).toEqual([1]);
	});
});

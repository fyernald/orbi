import { describe, expect, it } from 'vitest';
import { chartBoxHeight } from './chart-size';

describe('chartBoxHeight', () => {
	it('keeps the height the canvas asked for', () => {
		expect(chartBoxHeight('220')).toBe(220);
	});

	it('uses a chart-sized default without a usable height', () => {
		expect(chartBoxHeight(null)).toBe(240);
		expect(chartBoxHeight('')).toBe(240);
		expect(chartBoxHeight('tall')).toBe(240);
		expect(chartBoxHeight('0')).toBe(240);
	});

	it('keeps the box between 160 and 400 pixels', () => {
		expect(chartBoxHeight('40')).toBe(160);
		expect(chartBoxHeight('2000')).toBe(400);
	});
});

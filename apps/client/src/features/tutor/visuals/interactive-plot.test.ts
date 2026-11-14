import { compileInteractive, createInteractiveInput } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { interactivePlot } from './interactive-plot';

const tool = createInteractiveInput.parse({
	title: 'Area under the normal curve',
	controls: [
		{ name: 'z', label: 'z-score', type: 'slider', min: -3, max: 3, value: 1 },
	],
	chart: {
		xLabel: 'z',
		yLabel: 'Density',
		xMin: -4,
		xMax: 4,
		curves: [
			{ name: 'Normal', expression: 'normpdf(x)', shadeTo: 'z' },
			{ name: 'Line', expression: '0.1' },
		],
		markers: [{ label: 'z', x: 'z' }],
	},
	description: 'The normal curve shaded up to z.',
});
const compiled = compileInteractive(tool);
const chart = tool.chart!;

describe('interactivePlot', () => {
	it('shades the curve up to the control, ending exactly on it', () => {
		const plot = interactivePlot(compiled, { z: 0.3 }, chart, 9);

		expect(plot.shaded).toEqual([0]);
		const xs = plot.rows.map((row) => row.x);
		expect(xs).toContain(0.3);
		const edge = plot.rows.find((row) => row.x === 0.3)!;
		expect(edge.s0Shade).toBe(edge.s0);
		const after = plot.rows.find((row) => row.x === 1)!;
		expect(after.s0Shade).toBeNull();
		const before = plot.rows.find((row) => row.x === -1)!;
		expect(before.s0Shade).toBe(before.s0);
		expect(plot.markers).toEqual([{ label: 'z', x: 0.3 }]);
	});

	it('follows the control as it moves', () => {
		const left = interactivePlot(compiled, { z: -2 }, chart, 9);
		const right = interactivePlot(compiled, { z: 2 }, chart, 9);
		const shadedCount = (plot: typeof left) =>
			plot.rows.filter((row) => row.s0Shade !== null).length;
		expect(shadedCount(right)).toBeGreaterThan(shadedCount(left));
	});

	it('shades and marks nothing when the control is off the chart', () => {
		const plot = interactivePlot(compiled, { z: -5 }, chart, 9);
		expect(plot.rows.every((row) => row.s0Shade === null)).toBe(true);
		expect(plot.markers).toEqual([]);
	});
});

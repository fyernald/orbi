import { describe, expect, it } from 'vitest';
import { createInteractiveInput } from './interactive';
import {
	compileInteractive,
	startingValues,
	workOutValues,
} from './interactive-scope';

// the z-score example from US-42
const zScore = {
	title: 'Area under the normal curve',
	controls: [
		{
			name: 'z',
			label: 'z-score',
			type: 'slider',
			min: -3,
			max: 3,
			step: 0.1,
			value: 1,
		},
	],
	values: [
		{ name: 'p', label: 'P(Z ≤ z)', expression: 'normcdf(z)', decimals: 4 },
		{ name: 'pct', label: 'Share', expression: '100p', decimals: 1, unit: '%' },
	],
	chart: {
		xLabel: 'z',
		yLabel: 'Density',
		xMin: -4,
		xMax: 4,
		curves: [{ name: 'Normal curve', expression: 'normpdf(x)', shadeTo: 'z' }],
		markers: [{ label: 'z', x: 'z' }],
	},
	description: 'A normal curve shaded up to z, with the share to its left.',
};

const messagesOf = (input: unknown) => {
	const result = createInteractiveInput.safeParse(input);
	return result.success
		? []
		: result.error.issues.map(({ message }) => message);
};

describe('createInteractiveInput', () => {
	it('takes the z-score tool', () => {
		expect(messagesOf(zScore)).toEqual([]);
	});

	it('takes a tool of every control type with only values', () => {
		const ohm = {
			title: "Ohm's law",
			controls: [
				{
					name: 'V',
					label: 'Voltage (V)',
					type: 'number',
					min: 0,
					max: 24,
					value: 12,
				},
				{
					name: 'R',
					label: 'Resistance (Ω)',
					type: 'stepper',
					min: 1,
					max: 100,
					step: 1,
					value: 4,
				},
				{ name: 'dbl', label: 'Double it', type: 'toggle', value: 0 },
				{
					name: 'k',
					label: 'Unit',
					type: 'select',
					value: 1,
					options: [
						{ label: 'A', value: 1 },
						{ label: 'mA', value: 1000 },
					],
				},
			],
			values: [
				{ name: 'I', label: 'Current', expression: 'V / R * (1 + dbl) * k' },
			],
			description: 'Current from voltage and resistance.',
		};
		expect(messagesOf(ohm)).toEqual([]);
	});

	it('needs values or a chart', () => {
		const { values: _, chart: __, ...bare } = zScore;
		expect(messagesOf(bare)).toEqual(['Show some values, a chart, or both.']);
	});

	it('refuses names formulas already use, and repeated names', () => {
		const taken = {
			...zScore,
			controls: [{ ...zScore.controls[0], name: 'x' }],
			values: [{ ...zScore.values[0], name: 'sin', expression: 'normcdf(x)' }],
			chart: undefined,
		};
		expect(messagesOf(taken)).toEqual(
			expect.arrayContaining([
				'"x" already means something in formulas. Pick another name.',
				'"sin" already means something in formulas. Pick another name.',
			])
		);
		const repeated = {
			...zScore,
			values: [{ ...zScore.values[0], name: 'z' }],
		};
		expect(messagesOf(repeated)).toContain(
			'Give each control and value its own name.'
		);
	});

	it('checks each control for its type', () => {
		const controls = [
			{ name: 'a', label: 'A', type: 'slider', min: 2, max: 1, value: 1 },
			{ name: 'b', label: 'B', type: 'slider', min: 0, max: 1, value: 3 },
			{
				name: 'c',
				label: 'C',
				type: 'slider',
				min: 0,
				max: 100,
				step: 0.01,
				value: 3,
			},
			{ name: 'd', label: 'D', type: 'toggle', value: 2 },
			{
				name: 'f',
				label: 'F',
				type: 'select',
				value: 3,
				options: [
					{ label: 'One', value: 1 },
					{ label: 'Two', value: 2 },
				],
			},
		];
		expect(
			messagesOf({
				...zScore,
				controls,
				chart: undefined,
				values: [{ name: 'v', label: 'V', expression: '1' }],
			})
		).toEqual([
			'"A" needs min and max, with min below max.',
			'"B" must start between 0 and 1.',
			'"C" has more than 1000 steps. Use a bigger step.',
			'Toggle "D" starts at 0 (off) or 1 (on).',
			'Select "F" must start at one option\'s value.',
		]);
	});

	it('lets a value use only the controls and the values above it', () => {
		const later = {
			...zScore,
			values: [zScore.values[1], zScore.values[0]],
		};
		expect(messagesOf(later)[0]).toMatch(/Unknown name "p"/);
	});

	it('keeps x for the curves', () => {
		const shadeOnX = {
			...zScore,
			chart: {
				...zScore.chart,
				curves: [{ ...zScore.chart.curves[0], shadeTo: 'x' }],
			},
		};
		expect(messagesOf(shadeOnX)[0]).toMatch(/Unknown name "x"/);
	});

	it('refuses a value that is not a number when the tool starts', () => {
		const broken = {
			...zScore,
			values: [{ name: 'r', label: 'Root', expression: 'sqrt(z - 2)' }],
		};
		expect(messagesOf(broken)).toEqual([
			'"Root" is not a number at the starting values. Check the formula.',
		]);
	});
});

describe('workOutValues', () => {
	it('works out every value from the controls, in order', () => {
		const tool = createInteractiveInput.parse(zScore);
		const compiled = compileInteractive(tool);
		const start = workOutValues(compiled, startingValues(tool));
		expect(start.p).toBeCloseTo(0.8413, 4);
		expect(start.pct).toBeCloseTo(84.13, 2);
		expect(workOutValues(compiled, { z: 0 }).p).toBeCloseTo(0.5, 6);
	});
});

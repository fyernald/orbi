import type { InteractiveControl } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import {
	controlStep,
	fitToControl,
	formatControlValue,
	stepDecimals,
} from './control-values';

const slider: InteractiveControl = {
	name: 'z',
	label: 'z-score',
	type: 'slider',
	min: -3,
	max: 3,
	value: 0,
};

describe('controlStep', () => {
	it('keeps the step the AI gave, or picks a round one', () => {
		expect(controlStep({ ...slider, step: 0.5 })).toBe(0.5);
		expect(controlStep(slider)).toBe(0.1);
		expect(controlStep({ ...slider, min: 0, max: 1000 })).toBe(10);
		expect(controlStep({ ...slider, type: 'toggle' })).toBe(1);
	});
});

describe('stepDecimals', () => {
	it('counts the decimals a step needs', () => {
		expect(stepDecimals(0.25)).toBe(2);
		expect(stepDecimals(5)).toBe(0);
	});
});

describe('fitToControl', () => {
	it('keeps a typed value inside the range, on a step', () => {
		expect(fitToControl(slider, 1.234, 0)).toBe(1.2);
		expect(fitToControl(slider, 9, 0)).toBe(3);
		expect(fitToControl(slider, -9, 0)).toBe(-3);
		expect(fitToControl({ ...slider, min: 1, step: 2, max: 9 }, 4, 1)).toBe(5);
		expect(fitToControl(slider, -0.01, 1)).toBe(0);
		expect(Object.is(fitToControl(slider, -0.01, 1), -0)).toBe(false);
	});

	it('keeps the old value when the new one is not a number', () => {
		expect(fitToControl(slider, Number.NaN, 2)).toBe(2);
	});
});

describe('formatControlValue', () => {
	it('reads a value the way its control shows it', () => {
		expect(formatControlValue(slider, 1)).toBe('1.0');
		expect(formatControlValue({ ...slider, type: 'toggle' }, 1)).toBe('On');
		expect(
			formatControlValue(
				{
					...slider,
					type: 'select',
					options: [
						{ label: 'Earth', value: 9.81 },
						{ label: 'Moon', value: 1.62 },
					],
				},
				1.62
			)
		).toBe('Moon');
	});
});

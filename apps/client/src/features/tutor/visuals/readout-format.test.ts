import { describe, expect, it } from 'vitest';
import { formatReadout } from './readout-format';

describe('formatReadout', () => {
	it('shows the decimals asked for and the unit', () => {
		expect(formatReadout(0.841345, 4)).toBe('0.8413');
		expect(formatReadout(84.13, 1, '%')).toBe('84.1%');
		expect(formatReadout(12.5, undefined, 'm/s')).toBe('12.5 m/s');
		expect(formatReadout(-0.0001, 2)).toBe('0.00');
	});

	it('shows a dash for a value that is not a number', () => {
		expect(formatReadout(Number.POSITIVE_INFINITY)).toBe('—');
		expect(formatReadout(undefined)).toBe('—');
	});
});

import { describe, expect, it } from 'vitest';
import { formatLongDate, fromIsoDate, toIsoDate } from './dates';

describe('dates', () => {
	it('uses the local calendar day, even late in the evening', () => {
		expect(toIsoDate(new Date(2026, 9, 30, 23, 30))).toBe('2026-10-30');
	});

	it('reads a date back as the same day', () => {
		expect(toIsoDate(fromIsoDate('2027-01-15'))).toBe('2027-01-15');
	});

	it('writes the month in full', () => {
		expect(formatLongDate('2027-01-15')).toBe('15 January 2027');
	});
});

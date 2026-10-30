import { describe, expect, it } from 'vitest';
import {
	formatLongDate,
	formatShortDate,
	formatTimeAgo,
	fromIsoDate,
	toIsoDate,
} from './dates';

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

	it('writes a short date with the weekday', () => {
		expect(formatShortDate('2026-11-11')).toBe('Wed 11 Nov');
	});
});

describe('formatTimeAgo', () => {
	const now = new Date(2026, 9, 30, 15, 0);
	const at = (
		year: number,
		month: number,
		day: number,
		hour: number,
		minute: number,
		second = 0
	) => new Date(year, month, day, hour, minute, second).toISOString();

	it.each([
		[at(2026, 9, 30, 14, 59, 30), 'just now'],
		[at(2026, 9, 30, 14, 40), '20 min ago'],
		[at(2026, 9, 30, 9, 0), '6 h ago'],
		[at(2026, 9, 29, 23, 0), 'yesterday'],
		[at(2026, 9, 26, 12, 0), '4 days ago'],
		[at(2026, 9, 2, 12, 0), '2 Oct'],
		[at(2025, 11, 24, 12, 0), '24 Dec 2025'],
	])('%s is "%s"', (iso, label) => {
		expect(formatTimeAgo(iso, now)).toBe(label);
	});
});

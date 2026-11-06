import { describe, expect, it } from 'vitest';
import { localDate, startOfLocalDay } from './calendar';

describe('startOfLocalDay', () => {
	it("gives the student's local midnight", () => {
		const now = new Date('2026-11-06T21:30:00Z'); // 00:30 on 7 Nov in Istanbul

		expect(startOfLocalDay(now, 'Europe/Istanbul')).toEqual(
			new Date('2026-11-06T21:00:00Z')
		);
		expect(startOfLocalDay(now, 'UTC')).toEqual(
			new Date('2026-11-06T00:00:00Z')
		);
	});

	it('counts days forward', () => {
		const now = new Date('2026-11-06T12:00:00Z');

		expect(startOfLocalDay(now, 'Europe/Istanbul', 1)).toEqual(
			new Date('2026-11-06T21:00:00Z')
		);
	});

	it('crosses the end of a month', () => {
		const now = new Date('2026-11-30T12:00:00Z');

		expect(startOfLocalDay(now, 'UTC', 1)).toEqual(
			new Date('2026-12-01T00:00:00Z')
		);
	});

	it('handles a day when the clocks change', () => {
		// Berlin moves from UTC+2 to UTC+1 on 25 Oct 2026, so that day has 25 hours
		const now = new Date('2026-10-25T12:00:00Z');

		expect(startOfLocalDay(now, 'Europe/Berlin')).toEqual(
			new Date('2026-10-24T22:00:00Z')
		);
		expect(startOfLocalDay(now, 'Europe/Berlin', 1)).toEqual(
			new Date('2026-10-25T23:00:00Z')
		);
	});
});

describe('localDate', () => {
	it('gives the calendar date in the time zone', () => {
		const at = new Date('2026-11-06T22:00:00Z');

		expect(localDate(at, 'Europe/Istanbul')).toBe('2026-11-07');
		expect(localDate(at, 'America/New_York')).toBe('2026-11-06');
	});
});

import { describe, expect, it } from 'vitest';
import { timeIn, timeZoneParts } from './time-zones';

describe('timeZoneParts', () => {
	it.each([
		['Europe/Istanbul', { city: 'Istanbul', region: 'Europe' }],
		[
			'America/Argentina/Buenos_Aires',
			{ city: 'Buenos Aires', region: 'America / Argentina' },
		],
		['UTC', { city: 'UTC', region: '' }],
	])('%s', (zone, parts) => {
		expect(timeZoneParts(zone)).toEqual(parts);
	});
});

describe('timeIn', () => {
	it('gives the time in that zone', () => {
		const noonUtc = new Date('2026-10-30T12:00:00Z');

		expect(timeIn('Europe/Istanbul', noonUtc)).toBe('15:00');
		expect(timeIn('UTC', noonUtc)).toBe('12:00');
	});
});

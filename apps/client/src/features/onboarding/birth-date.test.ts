import { describe, expect, it } from 'vitest';
import {
	ageOn,
	birthYears,
	daysInMonth,
	toBirthDate,
	toDateParts,
} from './birth-date';

describe('toBirthDate', () => {
	it('joins the parts once all three are picked', () => {
		expect(toBirthDate({ day: 9, month: 3, year: 2004 })).toBe('2004-03-09');
		expect(toBirthDate({ day: 9, month: 3 })).toBeUndefined();
	});

	it('refuses a day the month does not have', () => {
		expect(toBirthDate({ day: 30, month: 2, year: 2004 })).toBeUndefined();
		expect(toBirthDate({ day: 29, month: 2, year: 2004 })).toBe('2004-02-29');
		expect(toBirthDate({ day: 29, month: 2, year: 2005 })).toBeUndefined();
	});
});

describe('toDateParts', () => {
	it('splits a saved date back into its parts', () => {
		expect(toDateParts('2004-12-10')).toEqual({
			day: 10,
			month: 12,
			year: 2004,
		});
		expect(toDateParts(undefined)).toEqual({});
	});
});

describe('daysInMonth', () => {
	it('knows short months and leap years', () => {
		expect(daysInMonth(4, 2004)).toBe(30);
		expect(daysInMonth(2, 2004)).toBe(29);
		expect(daysInMonth(2, 2005)).toBe(28);
		expect(daysInMonth(2)).toBe(29);
		expect(daysInMonth()).toBe(31);
	});
});

describe('birthYears', () => {
	it('starts 13 years back, the youngest age Orbi allows, and goes back to 1900', () => {
		const years = birthYears(new Date(2026, 9, 31));

		expect(years[0]).toBe(2013);
		expect(years.at(-1)).toBe(1900);
	});
});

describe('ageOn', () => {
	it('counts a year only once the birthday has passed', () => {
		const now = new Date(2026, 9, 31);

		expect(ageOn('2004-10-31', now)).toBe(22);
		expect(ageOn('2004-11-01', now)).toBe(21);
	});
});

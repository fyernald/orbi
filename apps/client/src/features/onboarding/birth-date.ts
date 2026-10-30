import { BIRTH_YEAR_MIN, MIN_AGE } from '@orbi/shared';

export type DateParts = { day?: number; month?: number; year?: number };

const pad = (value: number) => String(value).padStart(2, '0');

export function daysInMonth(month?: number, year?: number): number {
	if (!month) return 31;
	// day 0 of the next month is the last day of this one; a missing year counts as a leap year
	return new Date(Date.UTC(year ?? 2000, month, 0)).getUTCDate();
}

// "2004-12-10" from its three parts, or undefined until all three are picked and make a real day
export function toBirthDate({
	day,
	month,
	year,
}: DateParts): string | undefined {
	if (!day || !month || !year) return undefined;
	if (day > daysInMonth(month, year)) return undefined;
	return `${year}-${pad(month)}-${pad(day)}`;
}

export function toDateParts(birthDate?: string): DateParts {
	if (!birthDate) return {};
	const [year, month, day] = birthDate.split('-').map(Number);
	return { day, month, year };
}

// newest first, so most students find their year near the top; it starts at the
// youngest age Orbi allows, so nobody younger can pick a year
export function birthYears(now: Date): number[] {
	const latest = now.getFullYear() - MIN_AGE;
	return Array.from(
		{ length: latest - BIRTH_YEAR_MIN + 1 },
		(_, index) => latest - index
	);
}

// whole years old on that day
export function ageOn(birthDate: string, now: Date): number {
	const { day = 1, month = 1, year = 0 } = toDateParts(birthDate);
	const hadBirthday =
		now.getMonth() + 1 > month ||
		(now.getMonth() + 1 === month && now.getDate() >= day);
	return now.getFullYear() - year - (hadBirthday ? 0 : 1);
}

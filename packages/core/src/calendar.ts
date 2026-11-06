// Days in the student's time zone. "Today" starts at their local midnight, not
// the server's, so a question due at 23:00 in Istanbul is due today there.

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string) {
	let found = formatters.get(timeZone);
	if (!found) {
		found = new Intl.DateTimeFormat('en-US', {
			timeZone,
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
			hourCycle: 'h23',
		});
		formatters.set(timeZone, found);
	}
	return found;
}

function wallClock(at: Date, timeZone: string) {
	const parts: Record<string, number> = {};
	for (const { type, value } of formatter(timeZone).formatToParts(at)) {
		if (type !== 'literal') parts[type] = Number(value);
	}
	return parts as Record<
		'year' | 'month' | 'day' | 'hour' | 'minute' | 'second',
		number
	>;
}

// how far the time zone's clock is ahead of UTC at that moment
function offsetMs(at: Date, timeZone: string) {
	const { year, month, day, hour, minute, second } = wallClock(at, timeZone);
	const asUtc = Date.UTC(year, month - 1, day, hour, minute, second);
	return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

// local midnight of a calendar day; the offset is read twice, since it can change
// between the guess and midnight on a daylight saving day
function midnight(year: number, month: number, day: number, timeZone: string) {
	const utcMidnight = Date.UTC(year, month - 1, day);
	const guess = utcMidnight - offsetMs(new Date(utcMidnight), timeZone);
	return new Date(utcMidnight - offsetMs(new Date(guess), timeZone));
}

// the start of the local day that is `days` after the one `now` falls on
export function startOfLocalDay(now: Date, timeZone: string, days = 0): Date {
	const { year, month, day } = wallClock(now, timeZone);
	return midnight(year, month, day + days, timeZone);
}

// the local calendar date, like "2026-11-06"
export function localDate(at: Date, timeZone: string): string {
	const { year, month, day } = wallClock(at, timeZone);
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${year}-${pad(month)}-${pad(day)}`;
}

// Dates without a time ("2027-01-15") are handled as the student's own calendar day.

export function toIsoDate(date: Date): string {
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${date.getFullYear()}-${month}-${day}`;
}

export function fromIsoDate(isoDate: string): Date {
	const [year, month, day] = isoDate.split('-').map(Number);
	return new Date(year!, month! - 1, day);
}

// "2027-01-15" becomes "15 January 2027"
export function formatLongDate(isoDate: string): string {
	return fromIsoDate(isoDate).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// "just now", "5 min ago", "3 h ago", "yesterday", "4 days ago", then the date
export function formatTimeAgo(isoDateTime: string, now: Date): string {
	const then = new Date(isoDateTime);
	const passed = now.getTime() - then.getTime();
	if (passed < MINUTE) return 'just now';
	if (passed < HOUR) return `${Math.floor(passed / MINUTE)} min ago`;
	if (passed < DAY && then.getDate() === now.getDate()) {
		return `${Math.floor(passed / HOUR)} h ago`;
	}
	const days = Math.round(
		(fromIsoDate(toIsoDate(now)).getTime() -
			fromIsoDate(toIsoDate(then)).getTime()) /
			DAY
	);
	if (days <= 1) return 'yesterday';
	if (days < 7) return `${days} days ago`;
	return then.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: then.getFullYear() === now.getFullYear() ? undefined : 'numeric',
	});
}

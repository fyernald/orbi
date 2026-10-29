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

import { toIsoDate } from '@/lib/dates';

const DAY_MS = 24 * 60 * 60 * 1000;

// read as UTC, so the day never moves with the time zone
const utcDay = (isoDate: string) => Date.parse(`${isoDate}T00:00:00Z`);

// whole days from today to the exam; negative once it is over
export const daysUntil = (examDate: string, now: Date): number =>
	Math.round((utcDay(examDate) - utcDay(toIsoDate(now))) / DAY_MS);

// how far the exam is from today, for example "Exam in 23 days"
export function examCountdown(examDate: string, now: Date): string {
	const days = daysUntil(examDate, now);
	if (days === 0) return 'Exam today';
	if (days === 1) return 'Exam tomorrow';
	if (days > 1) return `Exam in ${days} days`;
	if (days === -1) return 'Exam was yesterday';
	return `Exam was ${-days} days ago`;
}

import { describe, expect, it } from 'vitest';
import { examCountdown } from './exam-date';

// late in the evening, when UTC is already the next day in some places
const now = new Date(2026, 9, 30, 23, 30);

describe('examCountdown', () => {
	it.each([
		['2026-10-30', 'Exam today'],
		['2026-10-31', 'Exam tomorrow'],
		['2026-11-22', 'Exam in 23 days'],
		['2026-10-29', 'Exam was yesterday'],
		['2026-10-20', 'Exam was 10 days ago'],
	])('%s is "%s"', (examDate, label) => {
		expect(examCountdown(examDate, now)).toBe(label);
	});
});

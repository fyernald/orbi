import { describe, expect, it } from 'vitest';
import { allSetSummary } from './all-set-summary';

describe('allSetSummary', () => {
	it('reads the answers back in plain words', () => {
		expect(
			allSetSummary({ dailyMinutes: 30, studyTime: 'evening', locale: 'tr' })
		).toEqual(['30 minutes a day', 'Evening reminders', 'Orbi in Türkçe']);
	});
});

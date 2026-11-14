import type { Profile } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { toReminderValues } from './reminder';

const saved = (changes: Partial<Profile>): Profile => ({
	preferredName: 'Ada',
	birthDate: '2004-12-10',
	uses: ['exam_prep'],
	educationLevel: 'undergraduate',
	fieldOfStudy: 'Computer Engineering',
	interests: ['Space'],
	explanationStyle: 'examples',
	dailyMinutes: 30,
	studyTime: 'morning',
	locale: 'en',
	timezone: 'Europe/Istanbul',
	reminderEnabled: false,
	reminderTime: null,
	defaultModelId: null,
	onboardedAt: '2026-11-01T10:00:00.000Z',
	tourSeenAt: null,
	...changes,
});

describe('toReminderValues', () => {
	it('keeps the saved reminder', () => {
		expect(
			toReminderValues(saved({ reminderEnabled: true, reminderTime: '07:30' }))
		).toEqual({ reminderEnabled: true, reminderTime: '07:30' });
	});

	it('suggests the start of the usual study time before one is picked', () => {
		expect(toReminderValues(saved({ studyTime: 'night' }))).toEqual({
			reminderEnabled: false,
			reminderTime: '22:00',
		});
	});

	it('suggests the evening without a study time', () => {
		expect(toReminderValues(saved({ studyTime: null })).reminderTime).toBe(
			'19:00'
		);
	});
});

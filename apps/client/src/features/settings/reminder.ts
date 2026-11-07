import type { Profile, ReminderSettings, StudyTime } from '@orbi/shared';

// No job sends the reminder emails yet (US-24), so the card is shown but cannot be
// changed. Set it to true once the emails go out.
export const REMINDER_EMAILS_SENT = false;

// before a time is picked, the reminder comes at the start of the usual study time
const studyTimeStarts: Record<StudyTime, string> = {
	morning: '09:00',
	afternoon: '14:00',
	evening: '19:00',
	night: '22:00',
};

const fallbackTime = studyTimeStarts.evening;

export function toReminderValues(saved: Profile): ReminderSettings {
	return {
		reminderEnabled: saved.reminderEnabled,
		reminderTime:
			saved.reminderTime ??
			(saved.studyTime ? studyTimeStarts[saved.studyTime] : fallbackTime),
	};
}

import type { Profile, ReminderSettings, StudyTime } from '@orbi/shared';

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

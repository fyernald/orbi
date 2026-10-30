import type { OnboardingAnswers } from '@orbi/shared';
import { dailyMinutes, locales, studyTimes } from './choices';

// a few of the answers, read back on the "all set" screen so the student sees Orbi listened
export function allSetSummary(
	answers: Pick<OnboardingAnswers, 'dailyMinutes' | 'studyTime' | 'locale'>
): string[] {
	return [
		`${dailyMinutes[answers.dailyMinutes].label} a day`,
		`${studyTimes[answers.studyTime].label} reminders`,
		`Orbi in ${locales[answers.locale].label}`,
	];
}

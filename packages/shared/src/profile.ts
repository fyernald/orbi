import { z } from 'zod';

export const EDUCATION_LEVELS = [
	'high_school',
	'undergraduate',
	'postgraduate',
] as const;
// how the student wants to use Orbi; Home suggestions and tutor actions follow it
export const PROFILE_USES = [
	'exam_prep',
	'keep_up',
	'learn_new',
	'hard_topics',
	'research',
	'revise_notes',
] as const;
export const EXPLANATION_STYLES = [
	'short',
	'step_by_step',
	'examples',
] as const;
// 60 stands for an hour or more
export const DAILY_MINUTES = [10, 20, 30, 60] as const;
export const STUDY_TIMES = [
	'morning',
	'afternoon',
	'evening',
	'night',
] as const;
export const LOCALES = ['en', 'tr'] as const;

export const USES_MAX = 3;
export const INTERESTS_MAX = 10;
export const INTEREST_MAX_LENGTH = 40;
export const FIELD_OF_STUDY_MAX_LENGTH = 100;
export const PREFERRED_NAME_MAX_LENGTH = 50;
export const BIRTH_YEAR_MIN = 1900;
// Orbi is for students aged 13 and over
export const MIN_AGE = 13;

const isTimeZone = (value: string) => {
	try {
		new Intl.DateTimeFormat('en', { timeZone: value });
		return true;
	} catch {
		return false;
	}
};

// a real day between 1900 and today; the minimum age is still to be decided in T-23
const isoDay = (date: Date) => date.toISOString().slice(0, 10);

// a real day between 1900 and today
const isPossibleBirthDate = (value: string) =>
	value >= `${BIRTH_YEAR_MIN}-01-01` && value <= isoDay(new Date());

// born on or before this day MIN_AGE years ago
const isOldEnough = (value: string) => {
	const latest = new Date();
	latest.setUTCFullYear(latest.getUTCFullYear() - MIN_AGE);
	return value <= isoDay(latest);
};

const isUnique = (values: string[]) =>
	new Set(values.map((value) => value.toLowerCase())).size === values.length;

export const interestName = z
	.string()
	.trim()
	.min(1, 'Enter an interest.')
	.max(INTEREST_MAX_LENGTH, `Use at most ${INTEREST_MAX_LENGTH} characters.`);

// every onboarding question; all of them must be answered before the app opens
export const onboardingAnswers = z.object({
	// what Orbi calls the student, which can differ from the name on the account
	preferredName: z
		.string()
		.trim()
		.min(1, 'Enter a name.')
		.max(
			PREFERRED_NAME_MAX_LENGTH,
			`Use at most ${PREFERRED_NAME_MAX_LENGTH} characters.`
		),
	birthDate: z.iso
		.date('Enter your date of birth.')
		.refine(isPossibleBirthDate, 'Enter your date of birth.')
		.refine(isOldEnough, `You need to be at least ${MIN_AGE} to use Orbi.`),
	uses: z
		.array(z.enum(PROFILE_USES))
		.min(1, 'Pick at least one.')
		.max(USES_MAX, `Pick at most ${USES_MAX}.`)
		.refine(isUnique, 'Pick each one only once.'),
	educationLevel: z.enum(EDUCATION_LEVELS, 'Choose where you study.'),
	fieldOfStudy: z
		.string()
		.trim()
		.min(1, 'Enter what you study.')
		.max(
			FIELD_OF_STUDY_MAX_LENGTH,
			`Use at most ${FIELD_OF_STUDY_MAX_LENGTH} characters.`
		),
	interests: z
		.array(interestName)
		.min(1, 'Add at least one interest.')
		.max(INTERESTS_MAX, `Add at most ${INTERESTS_MAX} interests.`)
		.refine(isUnique, 'Each interest can be added only once.'),
	explanationStyle: z.enum(
		EXPLANATION_STYLES,
		'Choose how you like explanations.'
	),
	dailyMinutes: z.literal(DAILY_MINUTES, 'Choose how long you want to study.'),
	studyTime: z.enum(STUDY_TIMES, 'Choose when you usually study.'),
	locale: z.enum(LOCALES, 'Choose a language.'),
	timezone: z.string().refine(isTimeZone, 'Choose a valid time zone.'),
});

// onboarding saves the answers of one question at a time
export const updateProfileInput = onboardingAnswers.partial();

// what the API sends back; a question not answered yet is null or an empty list
export const profile = z.object({
	preferredName: z.string().nullable(),
	birthDate: z.iso.date().nullable(),
	uses: z.array(z.enum(PROFILE_USES)),
	educationLevel: z.enum(EDUCATION_LEVELS).nullable(),
	fieldOfStudy: z.string().nullable(),
	interests: z.array(z.string()),
	explanationStyle: z.enum(EXPLANATION_STYLES).nullable(),
	dailyMinutes: z.literal(DAILY_MINUTES).nullable(),
	studyTime: z.enum(STUDY_TIMES).nullable(),
	locale: z.enum(LOCALES).nullable(),
	timezone: z.string().nullable(),
	// null until onboarding is finished; the app stays closed until then
	onboardedAt: z.iso.datetime().nullable(),
});

export type EducationLevel = (typeof EDUCATION_LEVELS)[number];
export type ProfileUse = (typeof PROFILE_USES)[number];
export type ExplanationStyle = (typeof EXPLANATION_STYLES)[number];
export type DailyMinutes = (typeof DAILY_MINUTES)[number];
export type StudyTime = (typeof STUDY_TIMES)[number];
export type Locale = (typeof LOCALES)[number];
export type OnboardingAnswers = z.infer<typeof onboardingAnswers>;
export type UpdateProfileInput = z.infer<typeof updateProfileInput>;
export type Profile = z.infer<typeof profile>;

import {
	DAILY_MINUTES,
	EDUCATION_LEVELS,
	EXPLANATION_STYLES,
	LOCALES,
	onboardingAnswers,
	PROFILE_USES,
	STUDY_TIMES,
	USES_MAX,
	type OnboardingAnswers,
	type Profile,
} from '@orbi/shared';
import { firstName } from '@/features/profile/first-name';
import {
	dailyMinutes,
	educationLevels,
	explanationStyles,
	locales,
	studyTimes,
	uses,
	type ChoiceInfo,
} from './choices';

export type AnswerField = keyof OnboardingAnswers;

export type Choice = ChoiceInfo & { value: string | number };

type StepText = {
	// the question, shown as the heading
	heading: string;
	// one line on why Orbi asks it
	why: string;
};

export type ChoiceField = Extract<
	AnswerField,
	| 'uses'
	| 'educationLevel'
	| 'explanationStyle'
	| 'dailyMinutes'
	| 'studyTime'
	| 'locale'
>;

// questions with their own kind of answer, each drawn by its own component
type InputKind =
	'preferredName' | 'birthDate' | 'fieldOfStudy' | 'interests' | 'timezone';

export type OnboardingStep =
	| { id: 'welcome'; kind: 'welcome'; fields: [] }
	| (StepText & {
			id: ChoiceField;
			kind: 'choice';
			fields: [ChoiceField];
			choices: Choice[];
			// how many can be picked; one choice moves on by itself
			max: number;
	  })
	| (StepText & {
			id: InputKind;
			kind: InputKind;
			fields: [AnswerField];
			// a text input that takes the focus itself, instead of the question heading
			focusInput?: boolean;
	  });

const toChoices = <T extends string | number>(
	values: readonly T[],
	info: Record<T, ChoiceInfo>
): Choice[] => values.map((value) => ({ value, ...info[value] }));

const choiceStep = (
	field: ChoiceField,
	text: StepText,
	choices: Choice[],
	max = 1
): OnboardingStep => ({
	id: field,
	kind: 'choice',
	fields: [field],
	choices,
	max,
	...text,
});

// the order the questions are asked in; a new question is a new entry here
export const onboardingSteps: OnboardingStep[] = [
	{ id: 'welcome', kind: 'welcome', fields: [] },
	{
		id: 'preferredName',
		kind: 'preferredName',
		fields: ['preferredName'],
		focusInput: true,
		heading: 'What should Orbi call you?',
		why: 'Orbi greets you and talks to you with this name.',
	},
	{
		id: 'birthDate',
		kind: 'birthDate',
		fields: ['birthDate'],
		heading: 'When is your birthday?',
		why: 'Orbi fits its examples and wording to your age.',
	},
	choiceStep(
		'uses',
		{
			heading: 'How do you want to use Orbi?',
			why: `Pick up to ${USES_MAX}. Your Home and tutor start with these.`,
		},
		toChoices(PROFILE_USES, uses),
		USES_MAX
	),
	choiceStep(
		'educationLevel',
		{
			heading: 'Where are you studying?',
			why: 'Orbi fits the difficulty and wording of questions to your level.',
		},
		toChoices(EDUCATION_LEVELS, educationLevels)
	),
	{
		id: 'fieldOfStudy',
		kind: 'fieldOfStudy',
		fields: ['fieldOfStudy'],
		focusInput: true,
		heading: 'What do you study?',
		why: 'Orbi uses the terms and examples of your field.',
	},
	{
		id: 'interests',
		kind: 'interests',
		fields: ['interests'],
		heading: 'What are you into?',
		why: 'The tutor uses them for examples, like explaining recursion with football.',
	},
	choiceStep(
		'explanationStyle',
		{
			heading: 'How do you like explanations?',
			why: 'This is how the AI tutor writes its answers to you.',
		},
		toChoices(EXPLANATION_STYLES, explanationStyles)
	),
	choiceStep(
		'dailyMinutes',
		{
			heading: 'How much do you want to study each day?',
			why: 'This sets the size of your daily study list and your streak goal.',
		},
		toChoices(DAILY_MINUTES, dailyMinutes)
	),
	choiceStep(
		'studyTime',
		{
			heading: 'When do you usually study?',
			why: 'Orbi sends your daily reminder around then.',
		},
		toChoices(STUDY_TIMES, studyTimes)
	),
	choiceStep(
		'locale',
		{
			heading: 'Which language should Orbi use?',
			why: 'AI questions and explanations come in this language.',
		},
		toChoices(LOCALES, locales)
	),
	{
		id: 'timezone',
		kind: 'timezone',
		fields: ['timezone'],
		heading: 'Is this your time zone?',
		why: 'Your study list, streaks, and reminders follow your days.',
	},
];

// whether these answers pass the same checks the server uses
export function isAnswered(
	fields: AnswerField[],
	answers: Partial<Record<AnswerField, unknown>>
): boolean {
	const mask = Object.fromEntries(fields.map((field) => [field, true]));
	return onboardingAnswers
		.pick(mask as Record<AnswerField, true>)
		.safeParse(answers).success;
}

// where a returning user picks up: the welcome screen if nothing is answered yet,
// otherwise the first question without an answer
export function firstOpenStep(steps: OnboardingStep[], saved: Profile): number {
	const open = steps.findIndex(
		(step) => step.fields.length > 0 && !isAnswered(step.fields, saved)
	);
	if (open === -1) return steps.length - 1;
	const started = steps.slice(0, open).some((step) => step.fields.length > 0);
	return started ? open : 0;
}

// the saved profile as form values; unanswered questions start empty, except the name,
// which starts as the first name of the account (text inputs start as '', so they are
// controlled inputs from the start)
export function toFormValues(
	saved: Profile,
	accountName: string
): Partial<OnboardingAnswers> {
	const values: Partial<Record<AnswerField, unknown>> = {
		preferredName: firstName(accountName),
		fieldOfStudy: '',
	};
	for (const [field, value] of Object.entries(saved)) {
		if (value !== null && field !== 'onboardedAt') {
			values[field as AnswerField] = value;
		}
	}
	return values as Partial<OnboardingAnswers>;
}

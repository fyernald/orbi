import {
	CHOICES_PER_QUESTION,
	MIN_CHOICES,
	type Question,
	type QuestionInput,
} from '@orbi/shared';

// what the form holds: no option is marked until the student picks one, and the
// schema makes sure one is before saving
export type QuestionFormValues = Omit<QuestionInput, 'correctChoice'> & {
	correctChoice: number | undefined;
};

// a new question starts with the fewest options it needs
export const emptyQuestion = (): QuestionFormValues => ({
	text: '',
	choices: Array.from({ length: MIN_CHOICES }, () => ''),
	correctChoice: undefined,
	explanation: '',
});

// a saved question, ready to edit
export function toQuestionValues(question: Question): QuestionFormValues {
	return {
		text: question.text,
		choices: question.choices,
		correctChoice: question.correctChoice,
		explanation: question.explanation ?? '',
	};
}

export const canAddChoice = (choices: string[]) =>
	choices.length < CHOICES_PER_QUESTION;

export const canRemoveChoice = (choices: string[]) =>
	choices.length > MIN_CHOICES;

type ChoiceValues = Pick<QuestionFormValues, 'choices' | 'correctChoice'>;

// the mark follows the correct option when one above it goes; removing the
// correct option leaves none marked
export function removeChoice(
	{ choices, correctChoice }: ChoiceValues,
	index: number
): ChoiceValues {
	return {
		choices: choices.filter((_, at) => at !== index),
		correctChoice:
			correctChoice === undefined || correctChoice === index
				? undefined
				: correctChoice > index
					? correctChoice - 1
					: correctChoice,
	};
}

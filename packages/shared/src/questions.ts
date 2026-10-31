import { z } from 'zod';

// only multiple choice for now; true/false and short answer come later
export const QUESTION_TYPES = ['multiple_choice'] as const;
export const QUESTION_STATUSES = ['pending', 'approved', 'rejected'] as const;
export const QUESTION_SOURCES = ['ai', 'manual'] as const;

export const CHOICES_PER_QUESTION = 4;
export const QUESTION_TEXT_MAX_LENGTH = 1000;
export const CHOICE_MAX_LENGTH = 300;
export const EXPLANATION_MAX_LENGTH = 1000;

const hasUniqueChoices = (choices: string[]) =>
	new Set(choices.map((choice) => choice.trim().toLowerCase())).size ===
	choices.length;

// one multiple-choice question as the AI writes it; the server checks it before saving
export const generatedQuestion = z.object({
	text: z
		.string()
		.trim()
		.min(1)
		.max(QUESTION_TEXT_MAX_LENGTH)
		.describe('The question, answerable from the notes alone.'),
	choices: z
		.array(z.string().trim().min(1).max(CHOICE_MAX_LENGTH))
		.length(CHOICES_PER_QUESTION)
		.refine(hasUniqueChoices, 'Each choice must be different.')
		.describe(
			'Exactly 4 answer choices. One is correct, the other 3 are wrong but believable.'
		),
	correctChoice: z
		.int()
		.min(0)
		.max(CHOICES_PER_QUESTION - 1)
		.describe('The index (0 to 3) of the correct choice.'),
	explanation: z
		.string()
		.trim()
		.min(1)
		.max(EXPLANATION_MAX_LENGTH)
		.describe(
			'One or two sentences on why the correct choice is right, based on the notes.'
		),
});

export type QuestionType = (typeof QUESTION_TYPES)[number];
export type QuestionStatus = (typeof QUESTION_STATUSES)[number];
export type QuestionSource = (typeof QUESTION_SOURCES)[number];
export type GeneratedQuestion = z.infer<typeof generatedQuestion>;

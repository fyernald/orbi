import { z } from 'zod';

export const TUTOR_ACTIONS = [
	'ask',
	'questions',
	'flashcards',
	'mockExam',
] as const;

export const TUTOR_MESSAGE_MAX_LENGTH = 20_000;

// what the home composer sends to the tutor; the attached files get their own
// field when the upload endpoint is built
export const tutorRequestInput = z.object({
	action: z.enum(TUTOR_ACTIONS),
	topicId: z.string().min(1, 'Choose a topic first.'),
	modelId: z.string().min(1, 'Choose a model first.'),
	message: z
		.string()
		.trim()
		.max(
			TUTOR_MESSAGE_MAX_LENGTH,
			`Use at most ${TUTOR_MESSAGE_MAX_LENGTH.toLocaleString('en')} characters.`
		),
});

export type TutorAction = (typeof TUTOR_ACTIONS)[number];
export type TutorRequestInput = z.infer<typeof tutorRequestInput>;

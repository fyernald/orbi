import { z } from 'zod';
import { COURSE_COLORS } from './courses';

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

// what the API sends back for a question; who made it stays on the server
export const question = z.object({
	id: z.uuid(),
	topicId: z.uuid(),
	type: z.enum(QUESTION_TYPES),
	text: z.string(),
	choices: z.array(z.string()),
	correctChoice: z.int(),
	explanation: z.string().nullable(),
	status: z.enum(QUESTION_STATUSES),
	createdAt: z.iso.datetime(),
});

// the questions of one topic that wait for review, with where the topic is
export const reviewTopic = z.object({
	courseId: z.uuid(),
	courseName: z.string(),
	courseColor: z.enum(COURSE_COLORS),
	topicId: z.uuid(),
	topicName: z.string(),
	questions: z.array(question),
});

export const questionParams = z.object({
	questionId: z.uuid('Question not found.'),
});

// pending again is how a reject or an approve is undone
export const updateQuestionInput = z.object({
	status: z.enum(QUESTION_STATUSES),
});

export const approveTopicQuestionsOutput = z.object({
	approved: z.int(),
});

export type Question = z.infer<typeof question>;
export type ReviewTopic = z.infer<typeof reviewTopic>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionInput>;

// where a question was answered: as practice in the tutor chat, or in a study session
export const ANSWER_CONTEXTS = ['chat', 'session'] as const;

export const answerQuestionInput = z.object({
	choice: z
		.int()
		.min(0)
		.max(CHOICES_PER_QUESTION - 1),
});

// the student's one try at a question in the chat
export const chatAnswer = z.object({
	questionId: z.uuid(),
	choice: z.int(),
	correct: z.boolean(),
});

// the questions of one set, as ?ids=a,b,c
export const chatAnswersQuery = z.object({
	ids: z
		.string()
		.transform((ids) => ids.split(',').filter(Boolean))
		.pipe(z.array(z.uuid()).min(1).max(50)),
});

export type AnswerContext = (typeof ANSWER_CONTEXTS)[number];
export type AnswerQuestionInput = z.infer<typeof answerQuestionInput>;
export type ChatAnswer = z.infer<typeof chatAnswer>;

// a question in a study session: the answer stays on the server until the student picks one
export const studyQuestion = question.pick({
	id: true,
	text: true,
	choices: true,
});

// the approved questions of one topic, in the order they were made
export const studySession = z.object({
	courseName: z.string(),
	topicName: z.string(),
	questions: z.array(studyQuestion),
	// questions still waiting for review, so an empty session can say what to do first
	pendingCount: z.int(),
});

// one answer in a study session, with what the student needs to learn from it
export const sessionAnswer = chatAnswer.extend({
	correctChoice: z.int(),
	explanation: z.string().nullable(),
});

export type StudyQuestion = z.infer<typeof studyQuestion>;
export type StudySession = z.infer<typeof studySession>;
export type SessionAnswer = z.infer<typeof sessionAnswer>;

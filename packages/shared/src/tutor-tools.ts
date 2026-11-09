import { z } from 'zod';
import { generatedQuestion } from './questions';
import type { CreateChartInput, CreateChartOutput } from './charts';
import type { CreateDiagramInput, CreateDiagramOutput } from './visuals';

// What the tutor's tools take and give back. The server checks the AI's input with
// these, and the client draws each tool from them. A new tool starts here, then gets
// a server tool (unless the student answers it) and a view in the chat.

export const QUESTIONS_PER_SET_MIN = 5;
export const QUESTIONS_PER_SET_MAX = 15;

export const createQuestionsInput = z.object({
	questions: z
		.array(generatedQuestion)
		.min(QUESTIONS_PER_SET_MIN)
		.max(QUESTIONS_PER_SET_MAX),
});

// the saved ids, in the same order as the questions
export const createQuestionsOutput = z.object({
	questionIds: z.array(z.uuid()),
});

export const ASK_STUDENT_OPTIONS_MIN = 2;
export const ASK_STUDENT_OPTIONS_MAX = 4;
export const ASK_STUDENT_ANSWER_MAX_LENGTH = 500;

export const askStudentInput = z.object({
	question: z
		.string()
		.trim()
		.min(1)
		.max(300)
		.describe('One short question that changes what the answer will be.'),
	options: z
		.array(z.string().trim().min(1).max(120))
		.min(ASK_STUDENT_OPTIONS_MIN)
		.max(ASK_STUDENT_OPTIONS_MAX)
		.describe('2 to 4 short answers the student can pick.'),
});

// skipped means the student let Orbi decide
export const askStudentOutput = z.object({
	answer: z.string().trim().max(ASK_STUDENT_ANSWER_MAX_LENGTH),
	skipped: z.boolean(),
});

// the tools that show a visual in the chat (US-42)
export const VISUAL_TOOL_NAMES = ['createDiagram', 'createChart'] as const;

export const TUTOR_TOOL_NAMES = [
	'createQuestions',
	'askStudent',
	...VISUAL_TOOL_NAMES,
] as const;

export type TutorToolName = (typeof TUTOR_TOOL_NAMES)[number];
export type VisualToolName = (typeof VISUAL_TOOL_NAMES)[number];

export const isVisualToolName = (name: string): name is VisualToolName =>
	(VISUAL_TOOL_NAMES as readonly string[]).includes(name);

// A reply part that is a tool other than a visual: question sets and Orbi's
// questions to the student. A reply with one gets no follow-up questions; a
// visual is part of an explanation, so it keeps them.
export const isNonVisualToolPart = (partType: string) =>
	partType.startsWith('tool-') &&
	!isVisualToolName(partType.slice('tool-'.length));

export type CreateQuestionsInput = z.infer<typeof createQuestionsInput>;
export type CreateQuestionsOutput = z.infer<typeof createQuestionsOutput>;
export type AskStudentInput = z.infer<typeof askStudentInput>;
export type AskStudentOutput = z.infer<typeof askStudentOutput>;

// the AI SDK's UITools shape, so chat messages are typed on both sides
export type TutorTools = {
	createQuestions: {
		input: CreateQuestionsInput;
		output: CreateQuestionsOutput;
	};
	askStudent: { input: AskStudentInput; output: AskStudentOutput };
	createDiagram: { input: CreateDiagramInput; output: CreateDiagramOutput };
	createChart: { input: CreateChartInput; output: CreateChartOutput };
};

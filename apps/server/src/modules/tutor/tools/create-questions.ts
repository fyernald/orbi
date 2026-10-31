import {
	createQuestionsInput,
	createQuestionsOutput,
	type GeneratedQuestion,
} from '@orbi/shared';
import { tool } from 'ai';

export type SaveQuestions = (
	questions: GeneratedQuestion[]
) => Promise<string[]>;

// the AI writes the questions as the tool input, so the client can show them while
// they stream in; they are saved as pending for the student to approve (US-05)
export const createQuestionsTool = (saveQuestions: SaveQuestions) =>
	tool({
		description:
			"Make multiple-choice practice questions from the student's notes on the current topic and save them for the student to review. Use it when the student asks for questions, a quiz, a test, or practice.",
		inputSchema: createQuestionsInput,
		outputSchema: createQuestionsOutput,
		execute: async ({ questions }) => ({
			questionIds: await saveQuestions(questions),
		}),
	});

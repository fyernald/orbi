import type { TutorToolName } from '@orbi/shared';
import type { Tool } from 'ai';
import { askStudentTool } from './ask-student';
import { createQuestionsTool, type SaveQuestions } from './create-questions';

export type TutorToolDeps = {
	saveQuestions: SaveQuestions;
};

// every tool the tutor can call; the names must match the shared TutorTools
export function createTutorTools({ saveQuestions }: TutorToolDeps) {
	return {
		createQuestions: createQuestionsTool(saveQuestions),
		askStudent: askStudentTool,
	} satisfies Record<TutorToolName, Tool>;
}

export type TutorToolSet = ReturnType<typeof createTutorTools>;

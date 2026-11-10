import type { TutorToolName } from '@orbi/shared';
import type { Tool } from 'ai';
import { askStudentTool } from './ask-student';
import { createChartTool } from './create-chart';
import { createDiagramTool } from './create-diagram';
import { createInteractiveTool } from './create-interactive';
import { createQuestionsTool, type SaveQuestions } from './create-questions';
import { createVisualBudget } from './visual-budget';

export type TutorToolDeps = {
	saveQuestions: SaveQuestions;
};

// every tool the tutor can call in one reply; the names must match the shared TutorTools
export function createTutorTools({ saveQuestions }: TutorToolDeps) {
	const visuals = createVisualBudget();
	return {
		createQuestions: createQuestionsTool(saveQuestions),
		askStudent: askStudentTool,
		createDiagram: createDiagramTool(visuals),
		createChart: createChartTool(visuals),
		createInteractive: createInteractiveTool(visuals),
	} satisfies Record<TutorToolName, Tool>;
}

export type TutorToolSet = ReturnType<typeof createTutorTools>;

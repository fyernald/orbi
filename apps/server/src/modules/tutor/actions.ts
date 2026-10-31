import type { TutorAction, TutorToolName } from '@orbi/shared';

type ActionRule =
	| {
			available: true;
			// the tool the reply has to start with
			tool?: TutorToolName;
			needsNotes: boolean;
	  }
	| { available: false; message: string };

// what each composer action does on the server; an action becomes available
// once its tool exists
export const actionRules: Record<TutorAction, ActionRule> = {
	ask: { available: true, needsNotes: false },
	questions: { available: true, tool: 'createQuestions', needsNotes: true },
	flashcards: {
		available: false,
		message:
			'Flashcards are coming soon. For now, ask Orbi or make practice questions.',
	},
	mockExam: {
		available: false,
		message:
			'Mock exams are coming soon. For now, ask Orbi or make practice questions.',
	},
};

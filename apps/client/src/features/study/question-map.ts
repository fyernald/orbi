import type { StudyRun } from './session';

export type QuestionResult = 'correct' | 'wrong' | 'skipped' | 'waiting';

// one question of the run, as the question map shows it
export type MapItem = {
	number: number;
	result: QuestionResult;
	current: boolean;
};

export function resultOf(
	answer: StudyRun['answers'][number] | undefined
): QuestionResult {
	if (answer === undefined) return 'waiting';
	if (answer === null) return 'skipped';
	return answer.correct ? 'correct' : 'wrong';
}

// read out after the question's number
export const resultLabels: Record<QuestionResult, string> = {
	correct: 'right',
	wrong: 'wrong',
	skipped: 'skipped',
	waiting: 'not answered yet',
};

// every question of the run in order; once the run is over none is current
export function questionMap(run: StudyRun, total: number): MapItem[] {
	return Array.from({ length: total }, (_, index) => ({
		number: index + 1,
		result: resultOf(run.answers[index]),
		current: index === run.index,
	}));
}

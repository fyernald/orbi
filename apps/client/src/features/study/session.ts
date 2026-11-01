import type { SessionAnswer } from '@orbi/shared';

// one study session in progress: the question shown, and what happened to each one
// before it; null is a question that had to be skipped
export type StudyRun = {
	index: number;
	answers: (SessionAnswer | null)[];
};

export const startRun = (): StudyRun => ({ index: 0, answers: [] });

export const isAnswered = (run: StudyRun) => run.answers.length > run.index;

export const isFinished = (run: StudyRun, total: number) => run.index >= total;

// the shown question takes one answer; a late second one is ignored
export function recordAnswer(run: StudyRun, answer: SessionAnswer): StudyRun {
	if (isAnswered(run)) return run;
	return { ...run, answers: [...run.answers, answer] };
}

// a question that was taken out of the student's study questions mid-session
export function skipQuestion(run: StudyRun): StudyRun {
	if (isAnswered(run)) return run;
	return { index: run.index + 1, answers: [...run.answers, null] };
}

export function nextQuestion(run: StudyRun): StudyRun {
	if (!isAnswered(run)) return run;
	return { ...run, index: run.index + 1 };
}

export type SessionSummary = { total: number; correct: number };

// skipped questions are left out, since they were never answered
export function summarize(answers: StudyRun['answers']): SessionSummary {
	const answered = answers.filter((answer) => answer !== null);
	return {
		total: answered.length,
		correct: answered.filter(({ correct }) => correct).length,
	};
}

// a short line for the end of the session, by how it went
export function summaryHeadline({ total, correct }: SessionSummary): string {
	if (total === 0) return 'Session done';
	if (correct === total) return 'All correct. Well done!';
	if (correct / total >= 0.7) return 'Nice work';
	return 'Keep going, you are learning';
}

// 1 to 4 or A to D picks that answer, so a session can be done from the keyboard
export function choiceForKey(key: string, choiceCount: number): number | null {
	const number = Number(key);
	const index = Number.isInteger(number)
		? number - 1
		: key.length === 1
			? key.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0)
			: -1;
	return index >= 0 && index < choiceCount ? index : null;
}

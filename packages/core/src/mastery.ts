export type ScoredAnswer = { correct: boolean; answeredAt: Date };

// an answer counts half as much after two weeks, a quarter after four
export const MASTERY_HALF_LIFE_DAYS = 14;

// counted as one wrong answer, so a single right answer gives 50, not 100
const PRIOR_WEIGHT = 1;

const DAY_MS = 24 * 60 * 60 * 1000;

// How well the student knows a topic, from 0 to 100, or null when the topic has
// no answers yet ("not started"). It is the share of right answers, with each
// answer weighted by how recent it is. A topic the student stops studying slowly
// goes down, since its answers lose weight and the prior wrong answer is left.
export function masteryScore(
	answers: ScoredAnswer[],
	now: Date
): number | null {
	if (answers.length === 0) return null;
	let right = 0;
	let total = PRIOR_WEIGHT;
	for (const { correct, answeredAt } of answers) {
		// an answer saved a moment ahead of this clock counts as new
		const ageDays = Math.max(0, now.getTime() - answeredAt.getTime()) / DAY_MS;
		const weight = 0.5 ** (ageDays / MASTERY_HALF_LIFE_DAYS);
		total += weight;
		if (correct) right += weight;
	}
	return Math.round((100 * right) / total);
}

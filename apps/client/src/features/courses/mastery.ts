import type { TopicMastery } from '@orbi/shared';

// a score is null before the topic's first answer
type Score = TopicMastery['score'];

export function masteryLabel(score: Score): string {
	return score === null ? 'Not started' : `${score}% mastery`;
}

// read out for the course's ring
export function courseMasteryLabel(score: Score): string {
	return score === null ? 'Course not started' : `Course mastery ${score}%`;
}

// How well the student knows the whole course: the average of its topics, with a
// topic that is not started counting as 0, so one well-known topic out of ten
// does not make the course look known. null until any topic is started.
export function courseMastery(scores: Score[]): Score {
	const started = scores.filter((score) => score !== null);
	if (started.length === 0) return null;
	const total = started.reduce((sum, score) => sum + score, 0);
	return Math.round(total / scores.length);
}

// for example "2 of 5 topics started"
export function startedLabel(scores: Score[]): string {
	const started = scores.filter((score) => score !== null).length;
	const topics = scores.length === 1 ? 'topic' : 'topics';
	return `${started} of ${scores.length} ${topics} started`;
}

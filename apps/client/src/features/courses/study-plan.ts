import type { Topic } from '@orbi/shared';
import { toIsoDate } from '@/lib/dates';
import { daysUntil } from './exam-date';

export type StudyDay = { date: string; topics: Topic[] };

const addDays = (now: Date, days: number) =>
	toIsoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + days));

// a topic ticked off before today is done; one ticked today stays in today's list
export const isDoneBefore = (topic: Topic, today: string) =>
	topic.planDoneOn !== null && topic.planDoneOn < today;

// Splits the topics still to study over the days before the exam, today first, and
// leaves the exam day for revision. It is worked out again from what is left each
// day, so a missed topic moves into the coming days with the rest.
export function studyPlan(
	topics: Topic[],
	examDate: string,
	now: Date
): StudyDay[] {
	const today = toIsoDate(now);
	const left = topics
		.filter((topic) => !isDoneBefore(topic, today))
		.sort((a, b) => a.position - b.position);
	const days = Math.max(1, daysUntil(examDate, now));

	const plan: StudyDay[] = [];
	left.forEach((topic, index) => {
		const date = addDays(now, Math.floor((index * days) / left.length));
		const last = plan.at(-1);
		if (last?.date === date) last.topics.push(topic);
		else plan.push({ date, topics: [topic] });
	});
	return plan;
}

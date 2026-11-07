import type { Topic } from '@orbi/shared';
import { toIsoDate } from '@/lib/dates';

const DAY_MS = 86_400_000;
const dayNumber = (date: string) => Date.parse(`${date}T00:00:00Z`) / DAY_MS;
const dateAt = (day: number) =>
	new Date(day * DAY_MS).toISOString().slice(0, 10);

export type StudyPlanState = {
	examDate: string;
	assignments: Record<string, string>;
	completed: Record<string, boolean>;
};

// Schedule new topics evenly over the remaining days, reserving exam day for review.
export function reconcileStudyPlan(
	previous: StudyPlanState | null,
	topics: Topic[],
	examDate: string,
	today = toIsoDate(new Date())
): StudyPlanState {
	const valid = previous?.examDate === examDate ? previous : null;
	const assignments: Record<string, string> = {};
	const completed: Record<string, boolean> = {};
	const ordered = [...topics].sort((a, b) => a.position - b.position);
	const first = dayNumber(today);
	const remainingDays = Math.max(1, dayNumber(examDate) - first);
	const unscheduled = ordered.filter((topic) => !valid?.assignments[topic.id]);
	for (const topic of ordered) {
		if (valid?.assignments[topic.id]) {
			const assignedDate = valid.assignments[topic.id];
			if (assignedDate !== undefined) {
				assignments[topic.id] = assignedDate;
			}
			if (valid.completed[topic.id]) completed[topic.id] = true;
		}
	}
	unscheduled.forEach((topic, index) => {
		assignments[topic.id] = dateAt(
			first +
				Math.floor((index * remainingDays) / Math.max(1, unscheduled.length))
		);
	});
	// A topic missed yesterday is scheduled for tomorrow, not silently marked done.
	for (const topic of ordered) {
		const assignedDate = assignments[topic.id];
		if (
			!completed[topic.id] &&
			assignedDate !== undefined &&
			dayNumber(assignedDate) < first
		) {
			assignments[topic.id] = dateAt(first + 1);
		}
	}
	return { examDate, assignments, completed };
}

export function topicsForDay(
	topics: Topic[],
	state: StudyPlanState,
	today: string
) {
	return topics.filter(
		(topic) =>
			!state.completed[topic.id] && state.assignments[topic.id] === today
	);
}

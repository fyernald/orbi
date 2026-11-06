import type { TodayPlan, TodayTopic } from '@orbi/shared';

// list: questions are left; done: the student answered some today and none are
// left; rest: nothing was due and nothing was answered
export type TodayState = 'list' | 'done' | 'rest';

export function todayState(plan: TodayPlan): TodayState {
	if (plan.topics.length > 0) return 'list';
	return plan.answeredToday > 0 ? 'done' : 'rest';
}

export const topicTotal = (topic: TodayTopic) =>
	topic.dueCount + topic.newCount;

export const planTotal = (plan: TodayPlan) =>
	plan.topics.reduce((sum, topic) => sum + topicTotal(topic), 0);

const plural = (count: number, word: string) =>
	`${count} ${count === 1 ? word : `${word}s`}`;

export const questionsLabel = (count: number) => plural(count, 'question');

// "4 due · 1 new", leaving out a zero
export function topicCounts(topic: TodayTopic): string {
	return [
		topic.dueCount > 0 && `${topic.dueCount} due`,
		topic.newCount > 0 && `${topic.newCount} new`,
	]
		.filter(Boolean)
		.join(' · ');
}

export const masteryLabel = (mastery: number | null) =>
	mastery === null ? 'Not started' : `Mastery ${mastery}`;

// dates are calendar days like "2026-11-06", read at noon UTC so no time zone
// moves them to another day
const atNoon = (date: string) => new Date(`${date}T12:00:00Z`);

function nextDay(date: string) {
	const day = atNoon(date);
	day.setUTCDate(day.getUTCDate() + 1);
	return day.toISOString().slice(0, 10);
}

const weekday = new Intl.DateTimeFormat('en-US', {
	weekday: 'short',
	timeZone: 'UTC',
});

export type ForecastDay = { date: string; label: string; count: number };

// the next days from tomorrow, with 0 for a day with nothing due
export function weekAhead(plan: TodayPlan, days = 7): ForecastDay[] {
	const counts = new Map(plan.upcoming.map(({ date, count }) => [date, count]));
	const forecast: ForecastDay[] = [];
	let date = plan.date;
	for (let i = 0; i < days; i += 1) {
		date = nextDay(date);
		forecast.push({
			date,
			label: i === 0 ? 'Tmrw' : weekday.format(atNoon(date)),
			count: counts.get(date) ?? 0,
		});
	}
	return forecast;
}

// questions done today against all of today's questions, done or not
export function progress(plan: TodayPlan) {
	const done = plan.questionsDoneToday;
	return { done, total: done + planTotal(plan) };
}

// "14 answered · 79% right"
export function answeredLine(plan: TodayPlan): string {
	const percent = Math.round((100 * plan.correctToday) / plan.answeredToday);
	return `${plan.answeredToday} answered · ${percent}% right`;
}

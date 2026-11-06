import type { TodayPlan, TodayTopic } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import {
	answeredLine,
	masteryLabel,
	planTotal,
	todayState,
	topicCounts,
	upcomingLine,
} from './today';

const topic = (counts: Partial<TodayTopic> = {}): TodayTopic => ({
	courseId: 'c',
	courseName: 'Biology 101',
	courseColor: 'teal',
	topicId: 't',
	topicName: 'Cells',
	dueCount: 0,
	newCount: 0,
	mastery: null,
	...counts,
});

const plan = (changes: Partial<TodayPlan> = {}): TodayPlan => ({
	date: '2026-11-06',
	topics: [],
	upcoming: [],
	answeredToday: 0,
	correctToday: 0,
	weakTopics: [],
	emptyTopics: [],
	...changes,
});

describe('todayState', () => {
	it('shows the list while questions are left', () => {
		expect(todayState(plan({ topics: [topic({ dueCount: 1 })] }))).toBe('list');
	});

	it('says done once the student answered everything', () => {
		expect(todayState(plan({ answeredToday: 3 }))).toBe('done');
	});

	it('rests when nothing was due', () => {
		expect(todayState(plan())).toBe('rest');
	});
});

describe('counts', () => {
	it('adds up every topic', () => {
		const topics = [
			topic({ dueCount: 4, newCount: 1 }),
			topic({ dueCount: 3 }),
		];
		expect(planTotal(plan({ topics }))).toBe(8);
	});

	it('leaves out a zero', () => {
		expect(topicCounts(topic({ dueCount: 4, newCount: 1 }))).toBe(
			'4 due · 1 new'
		);
		expect(topicCounts(topic({ newCount: 2 }))).toBe('2 new');
	});

	it('names a topic with no score as not started', () => {
		expect(masteryLabel(null)).toBe('Not started');
		expect(masteryLabel(38)).toBe('Mastery 38');
	});
});

describe('upcomingLine', () => {
	it('names tomorrow and then the weekdays', () => {
		const upcoming = [
			{ date: '2026-11-07', count: 4 },
			{ date: '2026-11-08', count: 2 },
			{ date: '2026-11-10', count: 7 },
			{ date: '2026-11-11', count: 1 },
		];
		expect(upcomingLine(plan({ upcoming }))).toBe('Tomorrow 4 · Sun 2 · Tue 7');
	});

	it('crosses the end of a month', () => {
		const upcoming = [{ date: '2026-12-01', count: 3 }];
		expect(upcomingLine(plan({ date: '2026-11-30', upcoming }))).toBe(
			'Tomorrow 3'
		);
	});

	it('gives nothing when nothing is coming', () => {
		expect(upcomingLine(plan())).toBeNull();
	});
});

describe('answeredLine', () => {
	it('gives the count and the share right', () => {
		expect(answeredLine(plan({ answeredToday: 14, correctToday: 11 }))).toBe(
			'14 answered · 79% right'
		);
	});
});

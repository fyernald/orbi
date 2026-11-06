import type { TodayPlan, TodayTopic } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import {
	answeredLine,
	masteryLabel,
	planTotal,
	progress,
	todayState,
	topicCounts,
	weekAhead,
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
	questionsDoneToday: 0,
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

describe('weekAhead', () => {
	it('gives the next seven days, from tomorrow, with the empty ones', () => {
		const upcoming = [
			{ date: '2026-11-07', count: 4 },
			{ date: '2026-11-10', count: 7 },
		];
		expect(weekAhead(plan({ upcoming }))).toEqual([
			{ date: '2026-11-07', label: 'Tmrw', count: 4 },
			{ date: '2026-11-08', label: 'Sun', count: 0 },
			{ date: '2026-11-09', label: 'Mon', count: 0 },
			{ date: '2026-11-10', label: 'Tue', count: 7 },
			{ date: '2026-11-11', label: 'Wed', count: 0 },
			{ date: '2026-11-12', label: 'Thu', count: 0 },
			{ date: '2026-11-13', label: 'Fri', count: 0 },
		]);
	});

	it('crosses the end of a month', () => {
		expect(weekAhead(plan({ date: '2026-11-30' }), 2)).toMatchObject([
			{ date: '2026-12-01' },
			{ date: '2026-12-02' },
		]);
	});
});

describe('progress', () => {
	it('counts the questions done today with the ones left', () => {
		const topics = [topic({ dueCount: 4, newCount: 2 })];
		expect(progress(plan({ topics, questionsDoneToday: 3 }))).toEqual({
			done: 3,
			total: 9,
		});
	});
});

describe('answeredLine', () => {
	it('gives the count and the share right', () => {
		expect(answeredLine(plan({ answeredToday: 14, correctToday: 11 }))).toBe(
			'14 answered · 79% right'
		);
	});
});

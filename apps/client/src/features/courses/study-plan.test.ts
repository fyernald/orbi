import { describe, expect, it } from 'vitest';
import { reconcileStudyPlan, topicsForDay } from './study-plan';

const topics = [
	{ id: 'one', courseId: 'course', name: 'One', position: 0, noteCount: 0 },
	{ id: 'two', courseId: 'course', name: 'Two', position: 1, noteCount: 0 },
	{ id: 'three', courseId: 'course', name: 'Three', position: 2, noteCount: 0 },
];

describe('study plan', () => {
	it('spreads topics over the days before the exam', () => {
		const plan = reconcileStudyPlan(null, topics, '2026-11-10', '2026-11-07');

		expect(plan.assignments).toEqual({
			one: '2026-11-07',
			two: '2026-11-08',
			three: '2026-11-09',
		});
		expect(topicsForDay(topics, plan, '2026-11-07')).toEqual([topics[0]]);
	});

	it('moves missed topics to tomorrow and keeps completed topics done', () => {
		const plan = reconcileStudyPlan(
			{
				examDate: '2026-11-10',
				assignments: {
					one: '2026-11-06',
					two: '2026-11-06',
					three: '2026-11-08',
				},
				completed: { two: true },
			},
			topics,
			'2026-11-10',
			'2026-11-07'
		);

		expect(plan.assignments).toEqual({
			one: '2026-11-08',
			two: '2026-11-06',
			three: '2026-11-08',
		});
		expect(plan.completed).toEqual({ two: true });
		expect(topicsForDay(topics, plan, '2026-11-08')).toEqual([
			topics[0],
			topics[2],
		]);
	});
});

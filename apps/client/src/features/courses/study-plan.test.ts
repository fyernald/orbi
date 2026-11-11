import type { Topic } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { studyPlan } from './study-plan';

const topic = (
	name: string,
	position: number,
	planDoneOn: string | null = null
): Topic => ({
	id: name,
	courseId: 'course',
	name,
	position,
	noteCount: 0,
	planDoneOn,
});

const now = new Date(2026, 10, 7, 9);
const names = (plan: ReturnType<typeof studyPlan>) =>
	plan.map((day) => [day.date, day.topics.map((t) => t.name)]);

describe('studyPlan', () => {
	it('spreads the topics over the days before the exam, in order', () => {
		const topics = [topic('Two', 1), topic('One', 0), topic('Three', 2)];

		expect(names(studyPlan(topics, '2026-11-10', now))).toEqual([
			['2026-11-07', ['One']],
			['2026-11-08', ['Two']],
			['2026-11-09', ['Three']],
		]);
	});

	it('puts several topics on a day when there are more topics than days', () => {
		const topics = ['A', 'B', 'C', 'D', 'E'].map((name, i) => topic(name, i));

		expect(names(studyPlan(topics, '2026-11-09', now))).toEqual([
			['2026-11-07', ['A', 'B', 'C']],
			['2026-11-08', ['D', 'E']],
		]);
	});

	it('moves a missed topic into the coming days', () => {
		// "One" was planned for yesterday and not ticked off
		const topics = [topic('One', 0), topic('Two', 1), topic('Three', 2)];

		expect(names(studyPlan(topics, '2026-11-09', now))).toEqual([
			['2026-11-07', ['One', 'Two']],
			['2026-11-08', ['Three']],
		]);
	});

	it('leaves out topics done before today and keeps the ones done today', () => {
		const topics = [
			topic('One', 0, '2026-11-06'),
			topic('Two', 1, '2026-11-07'),
			topic('Three', 2),
		];

		expect(names(studyPlan(topics, '2026-11-09', now))).toEqual([
			['2026-11-07', ['Two']],
			['2026-11-08', ['Three']],
		]);
	});

	it('puts everything on today when the exam is today', () => {
		const topics = [topic('One', 0), topic('Two', 1)];

		expect(names(studyPlan(topics, '2026-11-07', now))).toEqual([
			['2026-11-07', ['One', 'Two']],
		]);
	});

	it('is empty when every topic is done', () => {
		expect(
			studyPlan([topic('One', 0, '2026-11-01')], '2026-11-09', now)
		).toEqual([]);
	});
});

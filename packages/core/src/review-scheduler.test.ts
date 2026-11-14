import { describe, expect, it } from 'vitest';
import {
	defaultRating,
	MIN_EASE,
	createSm2Scheduler,
	type ReviewRating,
	type ReviewState,
} from './review-scheduler';

const scheduler = createSm2Scheduler();
const start = new Date('2026-11-06T09:00:00Z');
const daysAfter = (date: Date, days: number) =>
	new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

// answers on the day each answer makes the question due
function answerOnTime(ratings: ReviewRating[]) {
	let state: ReviewState | undefined;
	let now = start;
	for (const rating of ratings) {
		state = scheduler.next(state, rating, now);
		now = state.dueAt;
	}
	return state!;
}

describe('createSm2Scheduler', () => {
	it('brings a question back the next day after its first right answer', () => {
		expect(scheduler.next(undefined, 'good', start)).toEqual({
			repetitions: 1,
			intervalDays: 1,
			ease: 2.5,
			dueAt: daysAfter(start, 1),
		});
	});

	it('spaces right answers further apart each time', () => {
		const intervals = [1, 2, 3, 4, 5].map(
			(count) => answerOnTime(Array(count).fill('good')).intervalDays
		);
		expect(intervals).toEqual([1, 6, 15, 38, 95]);
	});

	it('starts a question over after a wrong answer and brings it back the next day', () => {
		const learned = answerOnTime(['good', 'good', 'good']);
		const missed = scheduler.next(learned, 'again', learned.dueAt);

		expect(missed).toEqual({
			repetitions: 0,
			intervalDays: 1,
			ease: 2.18,
			dueAt: daysAfter(learned.dueAt, 1),
		});
		expect(scheduler.next(missed, 'good', missed.dueAt).intervalDays).toBe(1);
	});

	it('changes the ease by how the answer felt', () => {
		const ease = (rating: ReviewRating) =>
			scheduler.next(undefined, rating, start).ease;

		expect(ease('again')).toBe(2.18);
		expect(ease('hard')).toBe(2.36);
		expect(ease('good')).toBe(2.5);
		expect(ease('easy')).toBe(2.6);
	});

	it('counts a hard answer as known', () => {
		expect(answerOnTime(['good', 'hard'])).toMatchObject({
			repetitions: 2,
			intervalDays: 6,
		});
	});

	it('spaces easy answers further than good ones', () => {
		const good = answerOnTime(['good', 'good', 'good', 'good']);
		const easy = answerOnTime(['easy', 'easy', 'easy', 'easy']);

		expect(easy.intervalDays).toBeGreaterThan(good.intervalDays);
	});

	it('never lets the ease go below 1.3', () => {
		const state = answerOnTime(Array(10).fill('again'));

		expect(state.ease).toBe(MIN_EASE);
		expect(answerOnTime(Array(10).fill('hard')).ease).toBe(MIN_EASE);
	});

	it('keeps the schedule after a right answer before the question is due', () => {
		const learned = answerOnTime(['good', 'good']);
		const early = daysAfter(learned.dueAt, -3);

		expect(scheduler.next(learned, 'good', early)).toBe(learned);
	});

	it('starts a question over after a wrong answer before it is due', () => {
		const learned = answerOnTime(['good', 'good']);
		const early = daysAfter(learned.dueAt, -3);

		expect(scheduler.next(learned, 'again', early)).toMatchObject({
			repetitions: 0,
			dueAt: daysAfter(early, 1),
		});
	});

	it('schedules from the answer time when a question is answered late', () => {
		const learned = answerOnTime(['good', 'good']);
		const late = daysAfter(learned.dueAt, 10);

		expect(scheduler.next(learned, 'good', late).dueAt).toEqual(
			daysAfter(late, 15)
		);
	});
});

describe('defaultRating', () => {
	it('rates a right answer good and a wrong one again', () => {
		expect(defaultRating(true)).toBe('good');
		expect(defaultRating(false)).toBe('again');
	});
});

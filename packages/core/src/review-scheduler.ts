// How a student felt about an answer. US-19 lets them pick one; until then the
// app picks it from whether the answer was right (defaultRating).
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

// where a question stands in its review schedule
export type ReviewState = {
	// right answers in a row
	repetitions: number;
	intervalDays: number;
	ease: number;
	dueAt: Date;
};

export interface ReviewScheduler {
	// previous is undefined for a question that was never answered
	next(
		previous: ReviewState | undefined,
		rating: ReviewRating,
		now: Date
	): ReviewState;
}

export const START_EASE = 2.5;
export const MIN_EASE = 1.3;

const DAY_MS = 24 * 60 * 60 * 1000;

// the SM-2 grade from 0 to 5; below 3 means the student did not know it
const GRADES: Record<ReviewRating, number> = {
	again: 2,
	hard: 3,
	good: 4,
	easy: 5,
};

export function defaultRating(correct: boolean): ReviewRating {
	return correct ? 'good' : 'again';
}

const addDays = (date: Date, days: number) =>
	new Date(date.getTime() + days * DAY_MS);

// SM-2 (Wozniak, 1990). A wrong answer starts the question over and brings it back
// the next day. Right answers bring it back after 1 day, then 6, then the last
// interval times the ease. The ease goes up after easy answers and down after hard
// and wrong ones, never below 1.3.
//
// One change: a right answer before the question is due keeps its schedule.
// A study session asks every question of a topic, so without this a student who
// studies a topic every day would push its questions months away in a week.
export const createSm2Scheduler = (): ReviewScheduler => ({
	next(previous, rating, now) {
		const grade = GRADES[rating];
		const known = grade >= 3;
		if (previous && known && now < previous.dueAt) return previous;

		const repetitions = previous?.repetitions ?? 0;
		const intervalDays = previous?.intervalDays ?? 0;
		const ease = previous?.ease ?? START_EASE;

		const miss = 5 - grade;
		// two decimals, so the sums do not drift like 2.5000000000000004
		const nextEase = Math.max(
			MIN_EASE,
			Math.round((ease + 0.1 - miss * (0.08 + miss * 0.02)) * 100) / 100
		);

		if (!known) {
			return {
				repetitions: 0,
				intervalDays: 1,
				ease: nextEase,
				dueAt: addDays(now, 1),
			};
		}

		const nextInterval =
			repetitions === 0
				? 1
				: repetitions === 1
					? 6
					: Math.round(intervalDays * ease);
		return {
			repetitions: repetitions + 1,
			intervalDays: nextInterval,
			ease: nextEase,
			dueAt: addDays(now, nextInterval),
		};
	},
});

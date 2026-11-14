import { MAX_PARALLEL_REPLIES } from '@orbi/shared';
import { TooManyRequestsError } from '../../errors';

// How many replies each student has running at once. Kept in memory, which is
// enough while the API runs as one process; a second process would need it in the database.
export interface ReplyLimiter {
	// a release function, or undefined when the student is at the limit
	acquire(userId: string): (() => void) | undefined;
}

export function createReplyLimiter(max: number): ReplyLimiter {
	const running = new Map<string, number>();

	return {
		acquire(userId) {
			const count = running.get(userId) ?? 0;
			if (count >= max) return undefined;
			running.set(userId, count + 1);

			// a reply can end in several ways at once (finished and aborted), so only the first counts
			let released = false;
			return () => {
				if (released) return;
				released = true;
				const left = (running.get(userId) ?? 1) - 1;
				if (left > 0) running.set(userId, left);
				else running.delete(userId);
			};
		},
	};
}

// The student can stop a reply before it has started, and an abort listener added
// after that never fires, so a signal that is already aborted frees the place at once
export function releaseOnAbort(release: () => void, signal: AbortSignal) {
	if (signal.aborted) return release();
	signal.addEventListener('abort', release, { once: true });
}

export type TakePlace = (userId: string) => () => void;

// Every model call takes one of the student's places, so replies, follow-up
// questions and PDF key points cannot run past the limit together; the caller
// frees it when done
export function createPlaceTaker(limiter: ReplyLimiter): TakePlace {
	return (userId) => {
		const release = limiter.acquire(userId);
		if (!release) {
			throw new TooManyRequestsError(
				`You can have ${MAX_PARALLEL_REPLIES} replies running at once. Wait for one to finish.`
			);
		}
		return release;
	};
}

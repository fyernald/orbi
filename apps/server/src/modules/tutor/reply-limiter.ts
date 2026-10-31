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

import { TooManyRequestsError } from '../../errors';

export interface UploadQueue {
	run<T>(userId: string, task: () => Promise<T>): Promise<T>;
}

// PDF reads take turns: one at a time for each student, and at most `running` on
// the whole server, so a few large files cannot take all its memory. The browser
// uploads every attached file at once, so the others wait instead of failing,
// up to `waitingPerStudent`. Kept in memory: the API runs as one process.
export function createUploadQueue({
	running = 2,
	waitingPerStudent = 5,
}: { running?: number; waitingPerStudent?: number } = {}): UploadQueue {
	let active = 0;
	const waiting: Array<() => void> = [];
	const lastOf = new Map<string, Promise<unknown>>();
	const countOf = new Map<string, number>();

	async function takePlace() {
		if (active < running) {
			active += 1;
			return;
		}
		// the place is handed over by the one that ends
		await new Promise<void>((resolve) => waiting.push(resolve));
	}

	function freePlace() {
		const next = waiting.shift();
		if (next) next();
		else active -= 1;
	}

	return {
		async run(userId, task) {
			const count = countOf.get(userId) ?? 0;
			if (count > waitingPerStudent) {
				throw new TooManyRequestsError(
					'Orbi is still reading your other PDFs. Wait for them, then try again.'
				);
			}
			countOf.set(userId, count + 1);
			const before = lastOf.get(userId) ?? Promise.resolve();
			const mine = before
				.catch(() => {})
				.then(async () => {
					await takePlace();
					try {
						return await task();
					} finally {
						freePlace();
					}
				});
			lastOf.set(userId, mine);
			try {
				return await mine;
			} finally {
				const left = countOf.get(userId)! - 1;
				if (left === 0) {
					countOf.delete(userId);
					lastOf.delete(userId);
				} else {
					countOf.set(userId, left);
				}
			}
		},
	};
}

// Runs fn on every item with at most `limit` running at once and gives the
// results back in the items' order. The first failure is thrown once the calls
// already running have ended, and no new call starts after it.
export async function mapLimit<T, R>(
	items: readonly T[],
	limit: number,
	fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
	const results = new Array<R>(items.length);
	let next = 0;
	let failed = false;
	let failure: unknown;

	async function worker() {
		while (!failed && next < items.length) {
			const index = next;
			next += 1;
			try {
				results[index] = await fn(items[index]!, index);
			} catch (error) {
				if (!failed) failure = error;
				failed = true;
			}
		}
	}

	const workers = Array.from(
		{ length: Math.min(Math.max(limit, 1), items.length) },
		worker
	);
	await Promise.all(workers);
	if (failed) throw failure;
	return results;
}

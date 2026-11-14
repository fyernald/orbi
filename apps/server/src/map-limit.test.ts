import { describe, expect, it } from 'vitest';
import { mapLimit } from './map-limit';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('mapLimit', () => {
	it('gives the results back in the order of the items', async () => {
		const results = await mapLimit([30, 10, 20], 3, async (ms, index) => {
			await wait(ms);
			return index;
		});

		expect(results).toEqual([0, 1, 2]);
	});

	it('runs at most limit calls at once', async () => {
		let running = 0;
		let most = 0;
		await mapLimit([1, 2, 3, 4, 5], 2, async () => {
			running += 1;
			most = Math.max(most, running);
			await wait(5);
			running -= 1;
		});

		expect(most).toBe(2);
	});

	it('throws the first failure and starts no new call after it', async () => {
		const started: number[] = [];
		const run = mapLimit([0, 1, 2, 3], 1, async (item) => {
			started.push(item);
			if (item === 1) throw new Error('part 2 failed');
		});

		await expect(run).rejects.toThrow('part 2 failed');
		expect(started).toEqual([0, 1]);
	});

	it('gives an empty list for no items', async () => {
		await expect(mapLimit([], 3, async () => 1)).resolves.toEqual([]);
	});
});

import { describe, expect, it } from 'vitest';
import { TooManyRequestsError } from '../../errors';
import { createUploadQueue } from './upload-queue';

// a task that ends when its finish() is called, and records when it started
function controlledTask(started: string[], name: string) {
	let finish!: () => void;
	const done = new Promise<void>((resolve) => (finish = resolve));
	return {
		task: async () => {
			started.push(name);
			await done;
			return name;
		},
		finish: () => finish(),
	};
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('createUploadQueue', () => {
	it("runs one student's uploads one after another, in order", async () => {
		const queue = createUploadQueue({ running: 5 });
		const started: string[] = [];
		const first = controlledTask(started, 'first');
		const second = controlledTask(started, 'second');

		const results = [
			queue.run('ada', first.task),
			queue.run('ada', second.task),
		];
		await tick();
		expect(started).toEqual(['first']);

		first.finish();
		await tick();
		expect(started).toEqual(['first', 'second']);
		second.finish();
		expect(await Promise.all(results)).toEqual(['first', 'second']);
	});

	it('runs different students side by side, up to the limit', async () => {
		const queue = createUploadQueue({ running: 2 });
		const started: string[] = [];
		const tasks = ['ada', 'grace', 'nali'].map((name) =>
			controlledTask(started, name)
		);

		const results = tasks.map(({ task }, index) =>
			queue.run(['ada', 'grace', 'nali'][index]!, task)
		);
		await tick();
		expect(started).toEqual(['ada', 'grace']);

		tasks[0]!.finish();
		await tick();
		expect(started).toEqual(['ada', 'grace', 'nali']);
		tasks[1]!.finish();
		tasks[2]!.finish();
		await Promise.all(results);
	});

	it('goes on after a failed upload', async () => {
		const queue = createUploadQueue();

		await expect(
			queue.run('ada', async () => {
				throw new Error('broken');
			})
		).rejects.toThrow('broken');

		expect(await queue.run('ada', async () => 'next')).toBe('next');
	});

	it('refuses an upload when too many are waiting already', async () => {
		const queue = createUploadQueue({ waitingPerStudent: 1 });
		const started: string[] = [];
		const first = controlledTask(started, 'first');
		const second = controlledTask(started, 'second');
		const running = queue.run('ada', first.task);
		const waiting = queue.run('ada', second.task);

		await expect(queue.run('ada', async () => 'third')).rejects.toBeInstanceOf(
			TooManyRequestsError
		);
		expect(await queue.run('grace', async () => 'other student')).toBe(
			'other student'
		);

		first.finish();
		second.finish();
		await Promise.all([running, waiting]);
		expect(await queue.run('ada', async () => 'later')).toBe('later');
	});
});

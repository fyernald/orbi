import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFirstOutputTimeout } from './first-output-timeout';

type Part = { type: string };

// sends the parts through the watch stream, one at a time
async function feed(
	timeout: ReturnType<typeof createFirstOutputTimeout>,
	parts: Part[]
) {
	const watch = timeout.watch<Part>();
	const writer = watch.writable.getWriter();
	const reader = watch.readable.getReader();
	for (const part of parts) {
		void writer.write(part);
		await reader.read();
	}
	return { writer, reader };
}

describe('createFirstOutputTimeout', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it('ends the reply when the model sends nothing in time', () => {
		const timeout = createFirstOutputTimeout(
			1_000,
			new AbortController().signal
		);

		vi.advanceTimersByTime(999);
		expect(timeout.signal.aborted).toBe(false);
		vi.advanceTimersByTime(1);

		expect(timeout.signal.aborted).toBe(true);
		expect(timeout.timedOut()).toBe(true);
		expect((timeout.signal.reason as Error).name).toBe('TimeoutError');
	});

	it('stops counting once the model starts answering', async () => {
		const timeout = createFirstOutputTimeout(
			1_000,
			new AbortController().signal
		);

		await feed(timeout, [{ type: 'start' }, { type: 'text-delta' }]);
		vi.advanceTimersByTime(5_000);

		expect(timeout.signal.aborted).toBe(false);
	});

	it('counts again for the next step, after a tool call', async () => {
		const timeout = createFirstOutputTimeout(
			1_000,
			new AbortController().signal
		);

		await feed(timeout, [{ type: 'tool-call' }, { type: 'finish-step' }]);
		vi.advanceTimersByTime(1_000);

		expect(timeout.timedOut()).toBe(true);
	});

	it('stops counting when the reply ends', async () => {
		const timeout = createFirstOutputTimeout(
			1_000,
			new AbortController().signal
		);

		await feed(timeout, [
			{ type: 'text-delta' },
			{ type: 'finish-step' },
			{ type: 'finish' },
		]);
		vi.advanceTimersByTime(5_000);

		expect(timeout.timedOut()).toBe(false);
	});

	it("passes the student's Stop on, and is then not a timeout", () => {
		const student = new AbortController();
		const timeout = createFirstOutputTimeout(1_000, student.signal);

		student.abort();
		vi.advanceTimersByTime(5_000);

		expect(timeout.signal.aborted).toBe(true);
		expect(timeout.timedOut()).toBe(false);
	});
});

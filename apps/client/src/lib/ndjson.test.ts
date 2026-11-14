import { describe, expect, it } from 'vitest';
import { createLineSplitter, readJsonLines } from './ndjson';

describe('createLineSplitter', () => {
	it('keeps a line cut in two until the rest comes', () => {
		const splitter = createLineSplitter();

		expect(splitter.push('{"a":1}\n{"b"')).toEqual(['{"a":1}']);
		expect(splitter.push(':2}\n')).toEqual(['{"b":2}']);
	});

	it('leaves out blank keep-alive lines', () => {
		expect(createLineSplitter().push('\n\n{"a":1}\n\n')).toEqual(['{"a":1}']);
	});

	it('gives the last line without a line break at the end', () => {
		const splitter = createLineSplitter();
		splitter.push('{"a":1}');

		expect(splitter.end()).toEqual(['{"a":1}']);
	});
});

describe('readJsonLines', () => {
	it('hands on every JSON value of the body in order', async () => {
		const encoder = new TextEncoder();
		const body = new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(encoder.encode('{"n":1}\n{"n"'));
				controller.enqueue(encoder.encode(':2}\n\n{"n":3}'));
				controller.close();
			},
		});
		const values: unknown[] = [];

		await readJsonLines(body, (value) => values.push(value));

		expect(values).toEqual([{ n: 1 }, { n: 2 }, { n: 3 }]);
	});
});

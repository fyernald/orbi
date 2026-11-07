import { describe, expect, it } from 'vitest';
import { parseTopicParam } from './topic-param';

describe('parseTopicParam', () => {
	it('takes a topic id', () => {
		const id = '0199be1c-22a3-4125-82fa-a5ce6a906072';

		expect(parseTopicParam(id)).toBe(id);
	});

	it('takes anything else as no topic', () => {
		expect(parseTopicParam('mitosis')).toBeUndefined();
		expect(parseTopicParam('')).toBeUndefined();
		expect(parseTopicParam(null)).toBeUndefined();
		expect(parseTopicParam(undefined)).toBeUndefined();
		// ?topic=a&topic=b
		expect(parseTopicParam(['a', 'b'])).toBeUndefined();
	});
});

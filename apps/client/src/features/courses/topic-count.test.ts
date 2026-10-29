import { describe, expect, it } from 'vitest';
import { topicCountLabel } from './topic-count';

describe('topicCountLabel', () => {
	it.each([
		[0, 'No topics yet'],
		[1, '1 topic'],
		[12, '12 topics'],
	])('%i is "%s"', (count, label) => {
		expect(topicCountLabel(count)).toBe(label);
	});
});

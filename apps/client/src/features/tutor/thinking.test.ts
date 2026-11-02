import { describe, expect, it } from 'vitest';
import { thinkingLabel } from './thinking';

describe('thinkingLabel', () => {
	it('says how long Orbi thought', () => {
		expect(thinkingLabel(6200)).toBe('Thought for 6s');
		expect(thinkingLabel(400)).toBe('Thought for a moment');
		expect(thinkingLabel(60_000)).toBe('Thought for 1m');
		expect(thinkingLabel(95_000)).toBe('Thought for 1m 35s');
	});

	it('has a plain name when there is no time', () => {
		expect(thinkingLabel(undefined)).toBe('Thought process');
		expect(thinkingLabel(0)).toBe('Thought process');
	});
});

import { describe, expect, it } from 'vitest';
import { isLongNote } from './note-preview';

describe('isLongNote', () => {
	it('is false for a short note', () => {
		expect(isLongNote('Mitosis has four phases.')).toBe(false);
	});

	it('is true for many lines', () => {
		expect(isLongNote('a\nb\nc\nd\ne\nf')).toBe(true);
	});

	it('is true for one long paragraph', () => {
		expect(isLongNote('word '.repeat(100))).toBe(true);
	});
});

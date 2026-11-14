import { describe, expect, it } from 'vitest';
import { isNotePreviewClipped } from './note-preview';

describe('isNotePreviewClipped', () => {
	it('is false when the whole preview fits', () => {
		expect(isNotePreviewClipped({ scrollHeight: 100, clientHeight: 100 })).toBe(
			false
		);
	});

	it('is true when the preview hides content', () => {
		expect(isNotePreviewClipped({ scrollHeight: 101, clientHeight: 100 })).toBe(
			true
		);
	});
});

import { NOTE_TITLE_MAX_LENGTH } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { noteTitle } from './title';

describe('noteTitle', () => {
	it('keeps a title the user gave', () => {
		expect(noteTitle('Mitosis', 'Cells divide')).toBe('Mitosis');
	});

	it('uses the first line with text when there is no title', () => {
		expect(noteTitle(undefined, '\n  \n  Phases of mitosis  \nProphase')).toBe(
			'Phases of mitosis'
		);
		expect(noteTitle('', 'Meiosis')).toBe('Meiosis');
	});

	it('shortens a long first line', () => {
		const title = noteTitle(undefined, 'a'.repeat(300));
		expect(title).toHaveLength(NOTE_TITLE_MAX_LENGTH);
		expect(title.endsWith('…')).toBe(true);
	});
});

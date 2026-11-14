import { describe, expect, it } from 'vitest';
import { notesReadLabel } from './notes-read';

describe('notesReadLabel', () => {
	it('says how many notes were read when every note fit', () => {
		expect(
			notesReadLabel(
				{ notesUsed: 4, notesTotal: 4, notesCut: false },
				'Mitosis'
			)
		).toEqual({ text: 'Read 4 notes from Mitosis', partial: false });
	});

	it('says how many of all the notes were read when some were left out', () => {
		expect(
			notesReadLabel(
				{ notesUsed: 4, notesTotal: 10, notesCut: true },
				'Mitosis'
			)
		).toEqual({ text: 'Read 4 of 10 notes from Mitosis', partial: true });
	});

	it('says when the last note was read only in part', () => {
		expect(
			notesReadLabel({ notesUsed: 3, notesTotal: 3, notesCut: true }, 'Mitosis')
		).toEqual({
			text: 'Read 3 notes from Mitosis, the last one only in part',
			partial: true,
		});
		expect(
			notesReadLabel({ notesUsed: 1, notesTotal: 1, notesCut: true }, 'Mitosis')
				?.text
		).toBe('Read 1 note from Mitosis, only in part');
	});

	it('keeps the old text for replies saved without the total', () => {
		expect(notesReadLabel({ notesUsed: 1 }, 'Mitosis')).toEqual({
			text: 'Read 1 note from Mitosis',
			partial: false,
		});
	});

	it('says when the topic has no notes, and nothing for a reply without notes', () => {
		expect(
			notesReadLabel({ notesUsed: 0, notesTotal: 0 }, 'Mitosis')?.text
		).toBe('No notes on Mitosis yet');
		expect(notesReadLabel({}, 'Mitosis')).toBeUndefined();
	});
});

import { NOTE_TITLE_MAX_LENGTH } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { cleanPageText, pdfNotes } from './pdf-notes';

describe('cleanPageText', () => {
	it('keeps line breaks and drops extra spaces and blank lines', () => {
		expect(cleanPageText('  Mitosis   phases \n\n\n\n Prophase\u0000 ')).toBe(
			'Mitosis phases\n\nProphase'
		);
	});
});

describe('pdfNotes', () => {
	it('saves a short PDF as one note named after the file', () => {
		expect(pdfNotes('Lecture 3.PDF', ['Cells', '', 'Ribosomes'])).toEqual([
			{ title: 'Lecture 3', content: 'Cells\n\nRibosomes' },
		]);
	});

	it('gives nothing when no page has text', () => {
		expect(pdfNotes('scan.pdf', ['', '  \n '])).toEqual([]);
	});

	it('splits a long PDF by pages, in order', () => {
		const pages = ['a'.repeat(40), 'b'.repeat(40), '', 'c'.repeat(40)];

		expect(pdfNotes('Week 1.pdf', pages, 90)).toEqual([
			{
				title: 'Week 1 · pages 1–2',
				content: `${'a'.repeat(40)}\n\n${'b'.repeat(40)}`,
			},
			{ title: 'Week 1 · page 4', content: 'c'.repeat(40) },
		]);
	});

	it('cuts a page longer than one note at a line break', () => {
		const page = `${'a'.repeat(60)}\n${'b'.repeat(60)}`;

		const notes = pdfNotes('Long.pdf', [page], 100);

		expect(notes.map((note) => note.content)).toEqual([
			'a'.repeat(60),
			'b'.repeat(60),
		]);
		expect(notes.map((note) => note.title)).toEqual([
			'Long · page 1',
			'Long · page 1',
		]);
	});

	it('shortens a long file name but keeps the pages', () => {
		const [first] = pdfNotes(`${'x'.repeat(200)}.pdf`, ['a', 'b'], 1);

		expect(first!.title).toHaveLength(NOTE_TITLE_MAX_LENGTH);
		expect(first!.title.endsWith('… · page 1')).toBe(true);
	});

	it('uses a default name when the file has none', () => {
		expect(pdfNotes('.pdf', ['Text'])[0]!.title).toBe('PDF notes');
	});
});

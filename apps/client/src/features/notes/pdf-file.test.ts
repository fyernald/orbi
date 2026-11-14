import { PDF_MAX_SIZE } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { pdfFileError, pdfSavedMessage } from './pdf-file';

const fileOf = (name: string, size = 1024) =>
	new File([new Uint8Array(size)], name);

describe('pdfFileError', () => {
	it('accepts a PDF, in any case', () => {
		expect(pdfFileError(fileOf('Lecture 3.PDF'))).toBeNull();
	});

	it('refuses other files, empty files and files over the limit', () => {
		expect(pdfFileError(fileOf('notes.docx'))).toMatch(/Only PDF/);
		expect(pdfFileError(fileOf('empty.pdf', 0))).toMatch(/empty/);
		expect(pdfFileError(fileOf('huge.pdf', PDF_MAX_SIZE + 1))).toMatch(
			/over 20 MB/
		);
	});
});

describe('pdfSavedMessage', () => {
	it('says how many notes Orbi wrote, or that there were notes already', () => {
		expect(pdfSavedMessage('a.pdf', 1)).toBe(
			'Orbi wrote the key points of a.pdf as a note.'
		);
		expect(pdfSavedMessage('a.pdf', 2)).toBe(
			'Orbi wrote the key points of a.pdf in 2 notes.'
		);
		expect(pdfSavedMessage('a.pdf', 1, true)).toBe('a.pdf already has notes.');
	});
});

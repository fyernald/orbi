import { describe, expect, it } from 'vitest';
import {
	attachmentError,
	attachmentKind,
	formatFileSize,
	maxAttachmentSize,
} from './attachments';

const fileOf = (name: string, size = 1024) =>
	new File([new Uint8Array(size)], name);

describe('attachmentKind', () => {
	it('finds the kind from the extension, in any case', () => {
		expect(attachmentKind(fileOf('lecture.PDF'))).toBe('pdf');
		expect(attachmentKind(fileOf('board.jpeg'))).toBe('image');
		expect(attachmentKind(fileOf('notes.md'))).toBe('text');
		expect(attachmentKind(fileOf('essay.docx'))).toBe('document');
		expect(attachmentKind(fileOf('week-3.pptx'))).toBe('slides');
	});

	it('returns null for other files', () => {
		expect(attachmentKind(fileOf('setup.exe'))).toBeNull();
		expect(attachmentKind(fileOf('README'))).toBeNull();
	});
});

describe('attachmentError', () => {
	it('accepts a supported file', () => {
		const file = fileOf('lecture.pdf');
		expect(attachmentError(file, attachmentKind(file))).toBeNull();
	});

	it('rejects unsupported, empty and too large files', () => {
		expect(attachmentError(fileOf('setup.exe'), null)).toBe('Not supported');
		expect(attachmentError(fileOf('empty.pdf', 0), 'pdf')).toBe('Empty file');
		expect(
			attachmentError(fileOf('huge.pdf', maxAttachmentSize + 1), 'pdf')
		).toBe('Over 20 MB');
	});
});

describe('formatFileSize', () => {
	it('shows KB under 1 MB and MB above', () => {
		expect(formatFileSize(200)).toBe('1 KB');
		expect(formatFileSize(512 * 1024)).toBe('512 KB');
		expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
	});
});

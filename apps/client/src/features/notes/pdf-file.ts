import { PDF_MAX_SIZE, PDF_MAX_SIZE_LABEL } from '@orbi/shared';

// the server checks the same limits; this only saves a useless upload
export function pdfFileError(file: File): string | null {
	if (!/\.pdf$/i.test(file.name)) return 'Only PDF files can be uploaded.';
	if (file.size === 0) return 'This file is empty.';
	if (file.size > PDF_MAX_SIZE) {
		return `This PDF is over ${PDF_MAX_SIZE_LABEL}. Split it into smaller files.`;
	}
	return null;
}

export function pdfSavedMessage(fileName: string, noteCount: number) {
	return noteCount === 1
		? `Saved ${fileName} as a note.`
		: `Saved ${fileName} as ${noteCount} notes, split by pages.`;
}

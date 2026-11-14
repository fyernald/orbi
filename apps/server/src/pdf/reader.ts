import { PDF_MAX_PAGES } from '@orbi/shared';
import { extractText, getDocumentProxy } from 'unpdf';

export interface PdfReader {
	// the text of every page in order; a page without text (a scan) is ''
	readPages(data: Uint8Array): Promise<string[]>;
}

// a file pdf.js could not open (locked with a password, or not a working PDF), one
// with more pages than the server reads, or one too slow or too big to read
export class PdfReadError extends Error {
	constructor(readonly reason: PdfReadErrorReason) {
		super(`The PDF is ${reason}.`);
		this.name = 'PdfReadError';
	}
}

export type PdfReadErrorReason =
	'locked' | 'broken' | 'tooManyPages' | 'tooHeavy';

export async function readPdfPages(
	data: Uint8Array,
	maxPages: number
): Promise<string[]> {
	let pdf;
	try {
		// pdf.js wants a plain Uint8Array, not a Node Buffer; verbosity 0 keeps
		// its warnings out of the server log
		pdf = await getDocumentProxy(new Uint8Array(data), { verbosity: 0 });
		// reading the text is the slow part, so the page count is checked first
		if (pdf.numPages > maxPages) throw new PdfReadError('tooManyPages');
		return (await extractText(pdf)).text;
	} catch (error) {
		if (error instanceof PdfReadError) throw error;
		const locked = (error as Error).name === 'PasswordException';
		throw new PdfReadError(locked ? 'locked' : 'broken');
	} finally {
		await pdf?.loadingTask.destroy();
	}
}

// reads on the server's own thread; the API uses createWorkerPdfReader instead
export function createPdfReader({
	maxPages = PDF_MAX_PAGES,
}: { maxPages?: number } = {}): PdfReader {
	return { readPages: (data) => readPdfPages(data, maxPages) };
}

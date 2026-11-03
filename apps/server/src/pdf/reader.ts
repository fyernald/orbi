import { extractText, getDocumentProxy } from 'unpdf';

export interface PdfReader {
	// the text of every page in order; a page without text (a scan) is ''
	readPages(data: Uint8Array): Promise<string[]>;
}

// a file pdf.js could not open: locked with a password, or not a working PDF
export class PdfReadError extends Error {
	constructor(readonly reason: 'locked' | 'broken') {
		super(`The PDF is ${reason}.`);
		this.name = 'PdfReadError';
	}
}

export function createPdfReader(): PdfReader {
	return {
		async readPages(data) {
			let pdf;
			try {
				// pdf.js wants a plain Uint8Array, not a Node Buffer; verbosity 0 keeps
				// its warnings out of the server log
				pdf = await getDocumentProxy(new Uint8Array(data), { verbosity: 0 });
				return (await extractText(pdf)).text;
			} catch (error) {
				const locked = (error as Error).name === 'PasswordException';
				throw new PdfReadError(locked ? 'locked' : 'broken');
			} finally {
				await pdf?.loadingTask.destroy();
			}
		},
	};
}

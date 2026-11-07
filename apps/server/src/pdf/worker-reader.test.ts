import { describe, expect, it } from 'vitest';
import { PdfReadError } from './reader';
import { createTestPdf } from './testing';
import { createWorkerPdfReader } from './worker-reader';

// starting a worker loads tsx and pdf.js, which can be slow on a busy machine
const SLOW = 30_000;

describe('createWorkerPdfReader', () => {
	it(
		'reads the pages in a worker thread',
		async () => {
			const reader = createWorkerPdfReader();

			const pages = await reader.readPages(
				createTestPdf(['Prophase', '', 'Anaphase'])
			);

			expect(pages).toEqual(['Prophase', '', 'Anaphase']);
		},
		SLOW
	);

	it(
		'gives the same errors as reading on the server thread',
		async () => {
			const reader = createWorkerPdfReader({ maxPages: 1 });

			await expect(
				reader.readPages(createTestPdf(['One', 'Two']))
			).rejects.toEqual(new PdfReadError('tooManyPages'));
			await expect(
				reader.readPages(new TextEncoder().encode('not a pdf'))
			).rejects.toEqual(new PdfReadError('broken'));
		},
		SLOW
	);

	it(
		'stops a read that takes too long',
		async () => {
			const reader = createWorkerPdfReader({ timeoutMs: 1 });

			await expect(
				reader.readPages(createTestPdf(['Prophase']))
			).rejects.toEqual(new PdfReadError('tooHeavy'));
		},
		SLOW
	);

	it(
		'keeps the caller’s bytes',
		async () => {
			const reader = createWorkerPdfReader();
			const pdf = createTestPdf(['Prophase']);
			const length = pdf.byteLength;

			await reader.readPages(pdf);

			expect(pdf.byteLength).toBe(length);
		},
		SLOW
	);
});

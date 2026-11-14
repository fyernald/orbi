import { describe, expect, it } from 'vitest';
import { pdfProgressView } from './pdf-progress';

describe('pdfProgressView', () => {
	it('shows how much of the file is sent, then that the text is read', () => {
		expect(
			pdfProgressView({ status: 'uploading', fileName: 'a.pdf', progress: 0.4 })
		).toEqual({
			label: 'Uploading 40%',
			percent: 40,
			barLabel: 'Uploading a.pdf',
		});
		expect(
			pdfProgressView({ status: 'uploading', fileName: 'a.pdf', progress: 1 })
				.label
		).toBe('Reading the text…');
	});

	it('names the part Orbi is writing in a long PDF', () => {
		expect(
			pdfProgressView({
				status: 'writing',
				fileName: 'a.pdf',
				done: 2,
				total: 6,
			})
		).toEqual({
			label: 'Writing key points · part 3 of 6',
			percent: 33,
			barLabel: 'Writing the key points of a.pdf',
		});
	});

	it('never shows an empty bar while writing, nor a part past the last', () => {
		const start = pdfProgressView({
			status: 'writing',
			fileName: 'a.pdf',
			done: 0,
			total: 1,
		});
		expect(start).toMatchObject({ label: 'Writing key points…', percent: 5 });
		expect(
			pdfProgressView({
				status: 'writing',
				fileName: 'a.pdf',
				done: 4,
				total: 4,
			}).label
		).toBe('Writing key points · part 4 of 4');
	});
});

import { describe, expect, it } from 'vitest';
import type { PdfReader } from '../../pdf/reader';
import type { NoteRepository } from './repository';
import { createNoteService } from './service';

// the topic is there when the service checks it, then deleted before the insert
const deletedWhileSaving = {
	topicExists: async () => true,
	listSourceNotes: async () => [],
	insertNote: async () => undefined,
	insertSourceNotes: async () => undefined,
} as Partial<NoteRepository> as NoteRepository;

const pdf: PdfReader = { readPages: async () => ['Prophase and metaphase'] };

const service = createNoteService({ repo: deletedWhileSaving, pdf });
// the same answer as a topic that does not exist
const topicNotFound = { status: 404, message: 'Topic not found.' };

describe('saving to a topic deleted at the same time', () => {
	it('answers that the topic was not found for a note', async () => {
		await expect(
			service.createNote('ada', 'course', 'topic', {
				title: 'Mitosis',
				content: 'Prophase',
			})
		).rejects.toMatchObject(topicNotFound);
	});

	it('answers that the topic was not found for a PDF', async () => {
		await expect(
			service.createNotesFromPdf('ada', 'course', 'topic', {
				fileName: 'cells.pdf',
				data: new Uint8Array([1, 2, 3]),
			})
		).rejects.toMatchObject(topicNotFound);
	});
});

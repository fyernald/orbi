import { createHash } from 'node:crypto';
import {
	PDF_MAX_NOTES,
	PDF_MAX_PAGES,
	type CreateNoteInput,
	type Note,
	type PdfUploadResult,
	type UpdateNoteInput,
} from '@orbi/shared';
import { NotFoundError, ValidationError } from '../../errors';
import { PdfReadError, type PdfReader } from '../../pdf/reader';
import { pdfNotes } from './pdf-notes';
import type { NoteRepository } from './repository';
import { noteTitle } from './title';

export type PdfUpload = { fileName: string; data: Uint8Array };

export interface NoteService {
	listNotes(userId: string, courseId: string, topicId: string): Promise<Note[]>;
	createNote(
		userId: string,
		courseId: string,
		topicId: string,
		input: CreateNoteInput
	): Promise<Note>;
	// the PDF's text is saved as notes, more than one when it is long; the same
	// file again gives back the notes it was saved as before
	createNotesFromPdf(
		userId: string,
		courseId: string,
		topicId: string,
		upload: PdfUpload
	): Promise<PdfUploadResult>;
	updateNote(
		userId: string,
		courseId: string,
		topicId: string,
		noteId: string,
		input: UpdateNoteInput
	): Promise<Note>;
	deleteNote(
		userId: string,
		courseId: string,
		topicId: string,
		noteId: string
	): Promise<void>;
}

const pdfMessages = {
	locked:
		'This PDF is locked with a password. Remove the password and try again.',
	broken:
		'Orbi could not open this file. Make sure it is a PDF that is not damaged.',
	noText:
		'This PDF has no text Orbi can read. It may be a scan or photos of pages. Paste the text instead.',
	tooLong: `This PDF has too much text for ${PDF_MAX_NOTES} notes. Split it into smaller files.`,
	tooManyPages: `This PDF has more than ${PDF_MAX_PAGES} pages. Upload only the chapters you need.`,
};

export function createNoteService({
	repo,
	pdf,
}: {
	repo: NoteRepository;
	pdf: PdfReader;
}): NoteService {
	async function readPdf(data: Uint8Array) {
		try {
			return await pdf.readPages(data);
		} catch (error) {
			if (error instanceof PdfReadError) {
				throw new ValidationError(pdfMessages[error.reason]);
			}
			throw error;
		}
	}

	// another user's topic answers the same as a missing one, so ids cannot be probed
	async function requireTopic(
		userId: string,
		courseId: string,
		topicId: string
	) {
		if (!(await repo.topicExists(userId, courseId, topicId))) {
			throw new NotFoundError('Topic not found.');
		}
	}

	return {
		async listNotes(userId, courseId, topicId) {
			await requireTopic(userId, courseId, topicId);
			return repo.listNotes(userId, topicId);
		},

		async createNote(userId, courseId, topicId, { title, content }) {
			await requireTopic(userId, courseId, topicId);
			return repo.insertNote(userId, topicId, {
				title: noteTitle(title, content),
				content,
			});
		},

		async createNotesFromPdf(userId, courseId, topicId, { fileName, data }) {
			await requireTopic(userId, courseId, topicId);
			// a deleted note is not brought back: the parts still there are given back.
			// Checked here first, so a file sent again is not read again
			const hash = createHash('sha256').update(data).digest('hex');
			const saved = await repo.listSourceNotes(userId, topicId, hash);
			if (saved.length > 0) return { notes: saved, reused: true };

			const notes = pdfNotes(fileName, await readPdf(data));
			if (notes.length === 0) throw new ValidationError(pdfMessages.noText);
			if (notes.length > PDF_MAX_NOTES) {
				throw new ValidationError(pdfMessages.tooLong);
			}
			return repo.insertSourceNotes(userId, topicId, notes, {
				name: fileName,
				hash,
			});
		},

		// a title cleared while editing is named after the first line again
		async updateNote(userId, courseId, topicId, noteId, { title, content }) {
			await requireTopic(userId, courseId, topicId);
			const updated = await repo.updateNote(userId, topicId, noteId, {
				title: noteTitle(title, content),
				content,
			});
			if (!updated) throw new NotFoundError('Note not found.');
			return updated;
		},

		// the questions made from it stay, since they belong to the topic
		async deleteNote(userId, courseId, topicId, noteId) {
			await requireTopic(userId, courseId, topicId);
			if (!(await repo.deleteNote(userId, topicId, noteId))) {
				throw new NotFoundError('Note not found.');
			}
		},
	};
}

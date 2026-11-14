import { createHash } from 'node:crypto';
import {
	PDF_MAX_NOTES,
	PDF_MAX_PAGES,
	type CreateNoteInput,
	type Note,
	type PdfUploadResult,
	type SavedPdf,
	type UpdateNoteInput,
} from '@orbi/shared';
import { NotFoundError, ValidationError } from '../../errors';
import { PdfReadError, type PdfReader } from '../../pdf/reader';
import { pdfNotes } from './pdf-notes';
import { createUploadQueue, type UploadQueue } from './upload-queue';
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
	// The PDF's text is saved out of the notes list, for the tutor and for the key
	// points Orbi writes next. The same file again is not read again: its text, and
	// the notes already written from it, are given back.
	savePdf(
		userId: string,
		courseId: string,
		topicId: string,
		upload: PdfUpload
	): Promise<PdfUploadResult>;
	listUnwrittenPdfs(
		userId: string,
		courseId: string,
		topicId: string
	): Promise<SavedPdf[]>;
	deletePdf(
		userId: string,
		courseId: string,
		topicId: string,
		fileHash: string
	): Promise<void>;
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
	tooHeavy:
		'This PDF took too long to read. Upload only the chapters you need.',
};

// a topic of another user, or one deleted while a note was saved, answers the same
const topicNotFound = () => new NotFoundError('Topic not found.');

export function createNoteService({
	repo,
	pdf,
	queue = createUploadQueue(),
}: {
	repo: NoteRepository;
	pdf: PdfReader;
	queue?: UploadQueue;
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
			throw topicNotFound();
		}
	}

	return {
		async listNotes(userId, courseId, topicId) {
			await requireTopic(userId, courseId, topicId);
			return repo.listNotes(userId, topicId);
		},

		async createNote(userId, courseId, topicId, { title, content }) {
			await requireTopic(userId, courseId, topicId);
			const created = await repo.insertNote(userId, topicId, {
				title: noteTitle(title, content),
				content,
			});
			if (!created) throw topicNotFound();
			return created;
		},

		async savePdf(userId, courseId, topicId, { fileName, data }) {
			await requireTopic(userId, courseId, topicId);
			const fileHash = createHash('sha256').update(data).digest('hex');
			const result = (textIds: string[], reused: boolean) =>
				repo
					.listPdfNotes(userId, topicId, fileHash)
					.then((notes) => ({ fileHash, textIds, notes, reused }));
			return queue.run(userId, async () => {
				// checked here first, so a file sent again is not read again
				const saved = await repo.findPdfText(userId, topicId, fileHash);
				if (saved) return result(saved.ids, true);

				const parts = pdfNotes(fileName, await readPdf(data));
				if (parts.length === 0) throw new ValidationError(pdfMessages.noText);
				if (parts.length > PDF_MAX_NOTES) {
					throw new ValidationError(pdfMessages.tooLong);
				}
				const created = await repo.savePdfText(userId, topicId, parts, {
					name: fileName,
					hash: fileHash,
				});
				if (!created) throw topicNotFound();
				return result(created.textIds, created.reused);
			});
		},

		async listUnwrittenPdfs(userId, courseId, topicId) {
			await requireTopic(userId, courseId, topicId);
			const pdfs = await repo.listUnwrittenPdfs(userId, topicId);
			return pdfs.map(({ savedAt, ...pdf }) => ({
				...pdf,
				savedAt: savedAt.toISOString(),
			}));
		},

		async deletePdf(userId, courseId, topicId, fileHash) {
			await requireTopic(userId, courseId, topicId);
			if (!(await repo.deletePdfText(userId, topicId, fileHash))) {
				throw new NotFoundError('PDF not found.');
			}
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

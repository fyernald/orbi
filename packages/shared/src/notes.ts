import { z } from 'zod';
import { topicParams } from './courses';

export const NOTE_TITLE_MAX_LENGTH = 120;
// about 25 pages of text; longer notes can be split into a few
export const NOTE_CONTENT_MAX_LENGTH = 50_000;

// the title is optional; without one the server names the note after its first line
export const createNoteInput = z.object({
	title: z
		.string()
		.trim()
		.max(
			NOTE_TITLE_MAX_LENGTH,
			`Use at most ${NOTE_TITLE_MAX_LENGTH} characters.`
		)
		.optional(),
	// kept as pasted, so line breaks and spacing stay; it only has to contain some text
	content: z
		.string()
		.regex(/\S/, 'Add some notes first. Empty notes cannot be saved.')
		.max(
			NOTE_CONTENT_MAX_LENGTH,
			`Use at most ${NOTE_CONTENT_MAX_LENGTH.toLocaleString('en')} characters. Split long notes into a few.`
		),
});

// an edit saves the whole note again, with the same rules as a new one
export const updateNoteInput = createNoteInput;

// a PDF is read on the server and its full text kept out of the notes list, split
// by pages into parts of at most PDF_NOTE_MAX_LENGTH characters (about 3 pages), so
// the tutor can read the parts it needs; the student sees the key points Orbi writes
export const PDF_MAX_SIZE = 20 * 1024 * 1024;
export const PDF_MAX_SIZE_LABEL = '20 MB';
export const PDF_NOTE_MAX_LENGTH = 6_000;
export const PDF_MAX_NOTES = 100;
// pdf.js reads every page on the server before Orbi can tell how much text there
// is, so a file with more pages is refused before it is read
export const PDF_MAX_PAGES = 300;

// the PDF itself is the request body; its name comes in the address
export const pdfUploadQuery = z.object({
	fileName: z.string().trim().min(1, 'The file needs a name.').max(255),
});

export const noteParams = topicParams.extend({
	noteId: z.uuid('Note not found.'),
});

// what the API sends back
export const note = z.object({
	id: z.uuid(),
	topicId: z.uuid(),
	title: z.string(),
	content: z.string(),
	// the PDF the note was written from, null for a note the student wrote
	sourceName: z.string().nullable(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
});

// a SHA-256 of the PDF's bytes names the file on its topic
export const fileHash = z
	.string()
	.regex(/^[0-9a-f]{64}$/, 'This PDF was not found. Upload it again.');

// The full text is saved as hidden parts (textIds), which a chat message can
// attach. notes are the key points already written from this file, empty until
// they are. The same PDF uploaded to the same topic again is not read twice:
// reused is set, so no copies end up in the tutor's notes.
export const pdfUploadResult = z.object({
	fileHash,
	textIds: z.array(z.uuid()),
	notes: z.array(note),
	reused: z.boolean(),
});

// a PDF Orbi has read on a topic that has no notes yet: attached in the chat, or
// its key points were cancelled. The student can write them or remove the file
export const savedPdf = z.object({
	fileHash,
	name: z.string(),
	savedAt: z.iso.datetime(),
});

export const pdfParams = topicParams.extend({ fileHash });

// Orbi writes the key points of an uploaded PDF with the model the student picked
// (US-44); it never picks another model
export const keyPointsInput = z.object({
	fileHash,
	modelId: z.string().min(1, 'Choose a model from the list.').max(100),
});

// the key points stream as one JSON object per line: the parts done so far, then
// the saved notes, or an error, after which nothing is saved
export const keyPointsEvent = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('progress'),
		done: z.number().int().min(0),
		total: z.number().int().min(1),
	}),
	z.object({ type: z.literal('done'), notes: z.array(note) }),
	z.object({ type: z.literal('error'), message: z.string() }),
]);

export type CreateNoteInput = z.infer<typeof createNoteInput>;
export type UpdateNoteInput = z.infer<typeof updateNoteInput>;
export type PdfUploadQuery = z.infer<typeof pdfUploadQuery>;
export type PdfUploadResult = z.infer<typeof pdfUploadResult>;
export type SavedPdf = z.infer<typeof savedPdf>;
export type KeyPointsInput = z.infer<typeof keyPointsInput>;
export type KeyPointsEvent = z.infer<typeof keyPointsEvent>;
export type Note = z.infer<typeof note>;

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

// a PDF is read on the server and its text saved as notes, split by pages into
// parts of at most PDF_NOTE_MAX_LENGTH characters (about 3 pages), so the tutor can
// read the parts it needs and the notes stay easy to read
export const PDF_MAX_SIZE = 20 * 1024 * 1024;
export const PDF_MAX_SIZE_LABEL = '20 MB';
export const PDF_NOTE_MAX_LENGTH = 6_000;
export const PDF_MAX_NOTES = 100;

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
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
});

// the same PDF uploaded to the same topic again is not read twice: its notes
// are given back with reused set, so no copies end up in the tutor's notes
export const pdfUploadResult = z.object({
	notes: z.array(note),
	reused: z.boolean(),
});

export type CreateNoteInput = z.infer<typeof createNoteInput>;
export type UpdateNoteInput = z.infer<typeof updateNoteInput>;
export type PdfUploadQuery = z.infer<typeof pdfUploadQuery>;
export type PdfUploadResult = z.infer<typeof pdfUploadResult>;
export type Note = z.infer<typeof note>;

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

// a PDF is read on the server and its text saved as notes; a long one is split
// into a few notes by pages, at most this many
export const PDF_MAX_SIZE = 20 * 1024 * 1024;
export const PDF_MAX_SIZE_LABEL = '20 MB';
export const PDF_MAX_NOTES = 20;

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

export type CreateNoteInput = z.infer<typeof createNoteInput>;
export type UpdateNoteInput = z.infer<typeof updateNoteInput>;
export type PdfUploadQuery = z.infer<typeof pdfUploadQuery>;
export type Note = z.infer<typeof note>;

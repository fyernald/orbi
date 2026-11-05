import { NOTE_TITLE_MAX_LENGTH, PDF_NOTE_MAX_LENGTH } from '@orbi/shared';

type NoteFields = { title: string; content: string };

type Part = { from: number; to: number; text: string };

// pdf.js text has runs of spaces, blank lines and sometimes control characters,
// which Postgres cannot store (\u0000); line breaks stay
export function cleanPageText(text: string): string {
	return text
		.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '') // eslint-disable-line no-control-regex
		.replace(/[^\S\n]+/g, ' ')
		.replace(/ ?\n ?/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

// the file name without .pdf is the title; a longer PDF becomes a few notes of a
// few pages each, named after their pages, in page order. Empty when no page has text
export function pdfNotes(
	fileName: string,
	pages: string[],
	maxLength = PDF_NOTE_MAX_LENGTH
): NoteFields[] {
	const parts: Part[] = [];
	pages.forEach((page, index) => {
		const text = cleanPageText(page);
		if (!text) return;
		const pageNumber = index + 1;
		for (const chunk of splitText(text, maxLength)) {
			const last = parts.at(-1);
			if (last && last.text.length + 2 + chunk.length <= maxLength) {
				last.text += `\n\n${chunk}`;
				last.to = pageNumber;
			} else {
				parts.push({ from: pageNumber, to: pageNumber, text: chunk });
			}
		}
	});

	const name = fileName.replace(/\.pdf$/i, '').trim() || 'PDF notes';
	if (parts.length === 1) {
		return [{ title: fitTitle(name, ''), content: parts[0]!.text }];
	}
	return parts.map(({ from, to, text }) => ({
		title: fitTitle(
			name,
			from === to ? ` · page ${from}` : ` · pages ${from}–${to}`
		),
		content: text,
	}));
}

// a page longer than one note is cut at line breaks where it can be
function splitText(text: string, maxLength: number): string[] {
	const chunks: string[] = [];
	let rest = text;
	while (rest.length > maxLength) {
		const lineBreak = rest.lastIndexOf('\n', maxLength);
		const cut = lineBreak > maxLength / 2 ? lineBreak : maxLength;
		chunks.push(rest.slice(0, cut).trimEnd());
		rest = rest.slice(cut).trimStart();
	}
	chunks.push(rest);
	return chunks;
}

// the page range always fits; a long file name is shortened instead
function fitTitle(name: string, suffix: string): string {
	const room = NOTE_TITLE_MAX_LENGTH - suffix.length;
	const short =
		name.length <= room ? name : `${name.slice(0, room - 1).trimEnd()}…`;
	return short + suffix;
}

import { NOTE_CONTENT_MAX_LENGTH } from '@orbi/shared';
import { fitTitle, pdfName, splitText } from '../pdf-notes';
import type { NoteFields } from '../repository';

// about 9,000 tokens of the PDF for each model call: big enough that a long file
// needs few calls, small enough that the key points of every page fit in the answer
export const KEY_POINTS_PART_LENGTH = 36_000;

// joins pieces in order, each run up to maxLength characters; a piece longer
// than that is cut at line breaks first
export function joinUpTo(pieces: string[], maxLength: number): string[] {
	const joined: string[] = [];
	for (const piece of pieces) {
		for (const chunk of splitText(piece.trim(), maxLength)) {
			if (!chunk) continue;
			const last = joined.at(-1);
			if (last !== undefined && last.length + 2 + chunk.length <= maxLength) {
				joined[joined.length - 1] = `${last}\n\n${chunk}`;
			} else {
				joined.push(chunk);
			}
		}
	}
	return joined;
}

// the PDF's saved text, in page order, as the parts Orbi reads one model call at a time
export const modelParts = (
	texts: string[],
	maxLength = KEY_POINTS_PART_LENGTH
): string[] => joinUpTo(texts, maxLength);

// The key points of every part, in order, as notes: one note when they fit,
// more only past the note length limit, cut between sections where it can be
export function keyPointNotes(
	fileName: string,
	sections: string[],
	maxLength = NOTE_CONTENT_MAX_LENGTH
): NoteFields[] {
	const contents = joinUpTo(sections, maxLength);
	const name = pdfName(fileName);
	return contents.map((content, index) => ({
		title: fitTitle(
			name,
			contents.length === 1
				? ' · key points'
				: ` · key points ${index + 1} of ${contents.length}`
		),
		content,
	}));
}

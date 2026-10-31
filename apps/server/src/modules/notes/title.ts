import { NOTE_TITLE_MAX_LENGTH } from '@orbi/shared';

// a note saved without a title is named after its first line of text
export function noteTitle(title: string | undefined, content: string): string {
	if (title) return title;
	const firstLine = content
		.split('\n')
		.map((line) => line.trim())
		.find((line) => line.length > 0)!;
	if (firstLine.length <= NOTE_TITLE_MAX_LENGTH) return firstLine;
	return `${firstLine.slice(0, NOTE_TITLE_MAX_LENGTH - 1).trimEnd()}…`;
}

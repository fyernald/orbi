// a note card shows the first lines; longer notes get a button to show the rest
const PREVIEW_LINES = 5;
const PREVIEW_CHARACTERS = 360;

export function isLongNote(content: string): boolean {
	return (
		content.length > PREVIEW_CHARACTERS ||
		content.split('\n').length > PREVIEW_LINES
	);
}

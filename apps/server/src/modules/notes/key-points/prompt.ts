// room for the key points of about 9,000 tokens of PDF text, with headings
export const KEY_POINTS_MAX_OUTPUT_TOKENS = 4_000;

// one part of a long PDF can take a while on a slow model
export const KEY_POINTS_PART_TIMEOUT_MS = 120_000;

export const keyPointsInstructions = [
	"You turn one part of a student's PDF into study notes with its important points.",
	'- Write Markdown: a `##` heading for each section of this part, then short `-` bullet points under it.',
	'- Cover every topic in this part, also the last pages. Leave nothing important out.',
	'- Keep key terms, definitions, formulas, numbers, dates and names exactly as the PDF writes them. Write formulas in LaTeX between $ signs.',
	'- Leave out page numbers, headers and footers, tables of contents, reference lists and text that repeats.',
	'- Use only what the text says. Do not add facts or examples of your own.',
	'- Write in the language of the PDF.',
	'- Answer with the notes only, without an introduction or a closing line.',
].join('\n');

export function keyPointsPrompt({
	fileName,
	text,
	index,
	total,
}: {
	fileName: string;
	text: string;
	index: number;
	total: number;
}): string {
	const where = total > 1 ? `part ${index + 1} of ${total} of ` : '';
	// the PDF's text is the student's content, fenced so it reads as data; it cannot
	// close its own block early
	const inside = text.replace(/<\/(pdf_text)(?=[\s>]|$)/gi, '<\\/$1');
	return `Write the key points of ${where}"${fileName}".\n\n<pdf_text>\n${inside}\n</pdf_text>`;
}

// a model sometimes wraps its whole answer in a code fence or adds blank lines
export function cleanKeyPoints(text: string): string {
	return text
		.trim()
		.replace(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i, '$1')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

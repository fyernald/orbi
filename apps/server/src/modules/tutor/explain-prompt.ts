import { notesBlock, type NotesSelection } from './prompt';

// enough notes for one question: the explanation only needs what the question is about
export const EXPLANATION_NOTES_MAX_LENGTH = 6_000;

// a few short sentences, with room for a model that writes a little more
export const EXPLANATION_MAX_OUTPUT_TOKENS = 600;

export type QuestionAnswered = {
	text: string;
	choices: string[];
	correctChoice: number;
	choice: number;
	// the short reason saved with the question, if any
	explanation: string | null;
};

// A, B, C, D, as the study session shows the choices
export const choiceLetter = (index: number) => String.fromCharCode(65 + index);

// text from a question cannot close the tag it is in
const inside = (content: string) =>
	content.replace(/<\/(question|choices|reason)(?=[\s>]|$)/gi, '<\\/$1');

export function explanationInstructions({
	topicName,
	notes,
}: {
	topicName: string;
	notes: NotesSelection;
}): string {
	return [
		`You are Orbi, a tutor. A student studying ${topicName} answered a multiple-choice question wrong and asked why.`,
		[
			'Rules:',
			"- Explain why the correct answer is right, then why the student's choice is wrong.",
			"- Base it on the student's notes. If the notes do not cover it, say so in a few words and explain it from general knowledge.",
			'- Two to four short sentences in plain text. No headings, no lists, no Markdown.',
			'- Write to the student as "you". Be kind: getting it wrong is how they learn.',
			'- Use the same language as the question.',
		].join('\n'),
		notesBlock(topicName, notes),
	].join('\n\n');
}

export function explanationPrompt(answered: QuestionAnswered): string {
	const choices = answered.choices
		.map((choice, index) => `${choiceLetter(index)}. ${choice}`)
		.join('\n');
	const reason = answered.explanation
		? `\n\nThe reason saved with the question:\n<reason>\n${inside(answered.explanation)}\n</reason>`
		: '';
	return [
		`<question>\n${inside(answered.text)}\n</question>`,
		`<choices>\n${inside(choices)}\n</choices>`,
		`The correct answer is ${choiceLetter(answered.correctChoice)}. The student chose ${choiceLetter(answered.choice)}.${reason}`,
	].join('\n\n');
}

// the model's text without spaces around it; undefined when it wrote nothing
export function cleanExplanation(text: string): string | undefined {
	const trimmed = text.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

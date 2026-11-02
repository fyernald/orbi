import { FOLLOW_UP_MAX_LENGTH, FOLLOW_UPS_MAX } from '@orbi/shared';
import { tool } from 'ai';
import { z } from 'zod';
import { notesBlock, type NotesSelection } from './prompt';

// far fewer notes than a reply reads: the questions follow the answer and only need
// the gist, and this part of the request is never cached
export const FOLLOW_UP_NOTES_MAX_LENGTH = 4_000;

const suggestFollowUpsInput = z.object({
	questions: z
		.array(z.string())
		.describe(
			`Up to ${FOLLOW_UPS_MAX} short questions, written the way the student would ask them.`
		),
});

// The model writes the questions as the input of this tool, so every provider
// gives them back in the same shape. Nothing runs: the input is the result.
export const suggestFollowUpsTool = tool({
	description: 'Suggest follow-up questions the student could ask Orbi next.',
	inputSchema: suggestFollowUpsInput,
});

export function followUpInstructions({
	scopeName,
	notes,
	exclude,
}: {
	scopeName: string;
	notes: NotesSelection;
	exclude: string[];
}): string {
	const seen = exclude.length
		? `\nThe student has already seen these, so write different ones:\n${exclude.map((question) => `- ${question}`).join('\n')}`
		: '';
	return [
		`You suggest follow-up questions for a student studying ${scopeName} with Orbi, their tutor. Call suggestFollowUps with up to ${FOLLOW_UPS_MAX} questions.`,
		[
			'Rules:',
			'- Each question goes one step deeper into what Orbi just explained, or checks that the student understood it, for example by asking for an example or how two ideas connect.',
			"- Stay on the content of Orbi's answer and the student's notes. Never bring in a new subject.",
			'- Do not ask what the answer already says.',
			`- Write them as the student asking Orbi, in the first person. One short question each, under ${FOLLOW_UP_MAX_LENGTH} characters, no numbering.`,
			"- Use the same language as Orbi's answer.",
			'- If the answer is small talk with nothing to go deeper into, give no questions.',
		].join('\n') + seen,
		notesBlock(scopeName, notes),
	].join('\n\n');
}

// the last exchange, which the questions follow on from
export const followUpPrompt = (studentText: string, replyText: string) =>
	`The student asked:\n<question>\n${studentText}\n</question>\n\nOrbi answered:\n<answer>\n${replyText}\n</answer>`;

const sameText = (text: string) => text.toLowerCase().replace(/\s+/g, ' ');

// what the model wrote, without empty, too long, repeated, or already seen questions
export function cleanFollowUps(input: unknown, exclude: string[]): string[] {
	const parsed = suggestFollowUpsInput.safeParse(input);
	if (!parsed.success) return [];
	const seen = new Set(exclude.map(sameText));
	const questions: string[] = [];
	for (const raw of parsed.data.questions) {
		const question = raw.trim();
		const key = sameText(question);
		if (!question || question.length > FOLLOW_UP_MAX_LENGTH || seen.has(key)) {
			continue;
		}
		seen.add(key);
		questions.push(question);
	}
	return questions.slice(0, FOLLOW_UPS_MAX);
}

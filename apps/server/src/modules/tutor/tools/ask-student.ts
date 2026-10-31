import { askStudentInput, askStudentOutput } from '@orbi/shared';
import { tool } from 'ai';

// no execute: the reply stops here, the student answers in the chat, and the
// browser sends the answer back so the reply can go on
export const askStudentTool = tool({
	description:
		'Ask the student one short clarifying question with 2 to 4 options. Use it only when the request could mean very different things and the answer changes what you make. Decide small details yourself. Ask at most once per reply.',
	inputSchema: askStudentInput,
	outputSchema: askStudentOutput,
});

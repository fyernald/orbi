import {
	askStudentOutput,
	type ChatMessage,
	type TutorMessageMetadata,
	type TutorTools,
} from '@orbi/shared';
import type { UIMessage } from 'ai';
import { z } from 'zod';
import type { StoredMessage } from './repository';

export type TutorUIMessage = UIMessage<TutorMessageMetadata, never, TutorTools>;

export function toUIMessage(stored: StoredMessage): TutorUIMessage {
	return {
		id: stored.id,
		role: stored.role,
		parts: stored.parts as TutorUIMessage['parts'],
		metadata: {
			topicId: stored.topicId,
			action: stored.action ?? undefined,
			modelId: stored.modelId ?? undefined,
			notesUsed: stored.notesUsed ?? undefined,
			notesTotal: stored.notesTotal ?? undefined,
			notesCut: stored.notesCut ?? undefined,
			thinkingMs: stored.thinkingMs ?? undefined,
			followUps: stored.followUps ?? undefined,
			attachments: stored.attachments ?? undefined,
			createdAt: stored.createdAt.toISOString(),
		},
	};
}

export function toStoredMessage(
	message: TutorUIMessage,
	fallbackDate: Date
): StoredMessage {
	const metadata = message.metadata;
	return {
		id: message.id,
		role: message.role === 'user' ? 'user' : 'assistant',
		parts: message.parts as Record<string, unknown>[],
		topicId: metadata?.topicId ?? null,
		action: metadata?.action ?? null,
		modelId: metadata?.modelId ?? null,
		notesUsed: metadata?.notesUsed ?? null,
		notesTotal: metadata?.notesTotal ?? null,
		notesCut: metadata?.notesCut ?? null,
		thinkingMs: metadata?.thinkingMs ?? null,
		followUps: metadata?.followUps ?? null,
		attachments: metadata?.attachments ?? null,
		createdAt: metadata ? new Date(metadata.createdAt) : fallbackDate,
	};
}

export const toChatMessage = (message: TutorUIMessage): ChatMessage => ({
	id: message.id,
	role: message.role === 'user' ? 'user' : 'assistant',
	parts: message.parts,
	metadata: message.metadata,
});

export const messageText = (message: Pick<TutorUIMessage, 'parts'>) =>
	message.parts
		.map((part) => (part.type === 'text' ? part.text : ''))
		.join('\n')
		.trim();

// The student's new message, made on the server from the text they wrote. The
// browser could add other parts (a file with a URL, provider options), which the
// model would read and the chat would keep; PDFs reach the tutor as notes instead,
// through the message's attachments.
export function studentMessageFrom(
	sent: Pick<ChatMessage, 'id' | 'parts'>,
	metadata: TutorMessageMetadata
): TutorUIMessage {
	const text = sent.parts
		.flatMap((part) =>
			part.type === 'text' && typeof part.text === 'string' ? [part.text] : []
		)
		.join('\n')
		.trim();
	return {
		id: sent.id,
		role: 'user',
		parts: [{ type: 'text', text }],
		metadata,
	};
}

type Part = TutorUIMessage['parts'][number];

// tools the student answers in the browser; a call to one waits for them
const STUDENT_TOOLS = new Set(['tool-askStudent']);

const toolState = (part: Part) =>
	part.type.startsWith('tool-') && 'state' in part ? part.state : undefined;

// a stopped reply can end inside a tool call; those parts are dropped before saving,
// or the model would get a call without a result next time
export function withoutUnfinishedTools(
	message: TutorUIMessage
): TutorUIMessage {
	const parts = message.parts.filter((part) => {
		const state = toolState(part);
		if (state === 'input-streaming') return false;
		if (state === 'input-available') return STUDENT_TOOLS.has(part.type);
		return true;
	});
	return { ...message, parts };
}

// a question the student never answered counts as skipped once they write something new
export function skipUnansweredQuestions(
	message: TutorUIMessage
): TutorUIMessage | undefined {
	let changed = false;
	const parts = message.parts.map((part) => {
		if (part.type !== 'tool-askStudent' || part.state !== 'input-available') {
			return part;
		}
		changed = true;
		return {
			...part,
			state: 'output-available' as const,
			output: { answer: '', skipped: true },
		};
	});
	return changed ? { ...message, parts } : undefined;
}

// a student's answer to askStudent, as the browser sends it back
const sentAnswer = z.looseObject({
	type: z.literal('tool-askStudent'),
	toolCallId: z.string(),
	state: z.literal('output-available'),
	output: askStudentOutput,
});

// The browser sends Orbi's last reply back with the student's answers to its
// questions. Only those answers are taken: the rest of the reply stays as it was
// saved, so the browser cannot change what Orbi said. Undefined when no open
// question got an answer.
export function withStudentAnswers(
	saved: TutorUIMessage,
	sent: Pick<ChatMessage, 'parts'>
): TutorUIMessage | undefined {
	const answers = new Map(
		sent.parts.flatMap((part) => {
			const parsed = sentAnswer.safeParse(part);
			return parsed.success
				? [[parsed.data.toolCallId, parsed.data.output] as const]
				: [];
		})
	);
	let answered = false;
	const parts = saved.parts.map((part) => {
		if (part.type !== 'tool-askStudent' || part.state !== 'input-available') {
			return part;
		}
		const output = answers.get(part.toolCallId);
		if (!output) return part;
		answered = true;
		return { ...part, state: 'output-available' as const, output };
	});
	return answered ? { ...saved, parts } : undefined;
}

// how many of the newest messages a reply sends to the model
export const MODEL_HISTORY_MAX = 20;
// how many a reply loads: a few more, so the student's last message is still there
// when the replies after it are tried again
export const HISTORY_LOADED = MODEL_HISTORY_MAX + 10;

// The newest messages, starting on one of the student's. A tool call and its result
// are one part of the same message, so the cut never splits them.
export function recentMessages(
	messages: TutorUIMessage[],
	max = MODEL_HISTORY_MAX
): TutorUIMessage[] {
	const recent = messages.slice(-max);
	const firstStudent = recent.findIndex(({ role }) => role === 'user');
	return firstStudent === -1 ? recent : recent.slice(firstStudent);
}

// Earlier replies go to the model without their thinking, which it does not need
// again. A reply that goes on after the student's answer keeps it: that is still the
// same turn, and Claude and DeepSeek want its thinking back.
export function withoutEarlierThinking(
	messages: TutorUIMessage[]
): TutorUIMessage[] {
	const continuing = messages.at(-1)?.role === 'assistant';
	return messages.map((message, index) => {
		const keep = continuing && index === messages.length - 1;
		if (message.role !== 'assistant' || keep) return message;
		return {
			...message,
			parts: message.parts.filter(({ type }) => type !== 'reasoning'),
		};
	});
}

// a reply that only explains, without question sets or questions for the student
export const isExplanation = (message: TutorUIMessage) =>
	message.role === 'assistant' &&
	messageText(message).length > 0 &&
	!message.parts.some((part) => part.type.startsWith('tool-'));

// a reply worth keeping has text, a finished or failed tool, or a question for the student
export function hasContent(message: TutorUIMessage): boolean {
	return message.parts.some((part) => {
		if (part.type === 'text') return part.text.trim().length > 0;
		if (part.type.startsWith('tool-')) {
			return 'state' in part && part.state !== 'input-streaming';
		}
		return false;
	});
}

// the notes of every PDF attached in the chat: the newest message's files first,
// each in page order
export function attachedNoteIds(messages: TutorUIMessage[]): string[] {
	const ids = [...messages]
		.reverse()
		.flatMap((message) => message.metadata?.attachments ?? [])
		.flatMap(({ noteIds }) => noteIds);
	return [...new Set(ids)];
}

// The model only reads text, so a message sent with PDFs says which ones. Their
// text is in the notes, marked with the file's name. Saved messages keep the
// attachments, so this works for earlier messages too.
export function withAttachmentNames(
	messages: TutorUIMessage[]
): TutorUIMessage[] {
	return messages.map((message) => {
		const files = message.metadata?.attachments;
		if (message.role !== 'user' || !files?.length) return message;
		const names = files.map(({ fileName }) => `"${fileName}"`).join(', ');
		const note = `[The student attached ${names} to this message. Its text is in the notes with that file attribute.]`;
		return {
			...message,
			parts: [{ type: 'text', text: note }, ...message.parts],
		};
	});
}

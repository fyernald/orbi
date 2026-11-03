import type {
	ChatMessage,
	TutorMessageMetadata,
	TutorTools,
} from '@orbi/shared';
import type { UIMessage } from 'ai';
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

// how many of the newest messages a reply sends to the model
export const MODEL_HISTORY_MAX = 20;

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

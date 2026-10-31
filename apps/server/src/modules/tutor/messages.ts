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

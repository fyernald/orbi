import type {
	ChatMessage,
	TutorAction,
	TutorMessageMetadata,
	TutorTools,
} from '@orbi/shared';
import { APICallError, type UIMessage } from 'ai';
import { composerActions } from './actions';

export type TutorUIMessage = UIMessage<TutorMessageMetadata, never, TutorTools>;
export type TutorPart = TutorUIMessage['parts'][number];

// what every request to the tutor carries besides the message
export type ChatContext = {
	courseId: string;
	// the topic the chat belongs to, or null for the whole-course chat
	chatTopicId: string | null;
	// null when a whole-course message is about no topic in particular
	topicId: string | null;
	modelId: string;
	action: TutorAction;
};

// Each topic has its own chat, and the course has one more for everything. A scope
// names one of them: a topic id, or COURSE_SCOPE.
export const COURSE_SCOPE = 'course';
export const scopeOf = (topicId: string | null) => topicId ?? COURSE_SCOPE;
export const scopeTopicId = (scope: string) =>
	scope === COURSE_SCOPE ? null : scope;

// the server sends the same UIMessage shape the chat uses
export const fromChatMessage = (message: ChatMessage) =>
	message as unknown as TutorUIMessage;

// the text the student's bubble shows; an empty Questions request still reads naturally
export function messageToSend(
	action: TutorAction,
	message: string,
	topicName: string
): string {
	const text = message.trim();
	if (text) return text;
	return composerActions[action].defaultMessage?.(topicName) ?? '';
}

const fallbackMessage = 'Orbi could not answer. Try again.';

// The server refused the request before it started (bad input, a missing topic, no
// AI key). Nothing was saved, so the student's message goes back into the composer.
export function isRejectedRequest(error: unknown): error is APICallError {
	return (
		APICallError.isInstance(error) &&
		error.statusCode !== undefined &&
		error.statusCode >= 400
	);
}

// a refused request carries Orbi's { error: { message } }; a failed stream carries
// the text the server wrote for students
export function chatErrorMessage(error: unknown): string {
	if (isRejectedRequest(error)) {
		try {
			const body = JSON.parse(error.responseBody ?? '') as {
				error?: { message?: string };
			};
			return body.error?.message ?? fallbackMessage;
		} catch {
			return fallbackMessage;
		}
	}
	// fetch fails with a TypeError when the connection drops ("network error", "Failed to fetch")
	if (error instanceof TypeError) {
		return 'Orbi could not be reached. Check your connection and try again.';
	}
	if (error instanceof Error && error.message) return error.message;
	return fallbackMessage;
}

export const isToolPart = (part: TutorPart) => part.type.startsWith('tool-');

// a reply has started to show once it has thinking, text, or a tool card
export function hasVisibleContent(
	message: TutorUIMessage | undefined
): boolean {
	return (
		message?.parts.some(
			(part) =>
				((part.type === 'text' || part.type === 'reasoning') &&
					part.text.trim().length > 0) ||
				isToolPart(part)
		) ?? false
	);
}

'use client';

import { useChat } from '@ai-sdk/react';
import type { AskStudentOutput, MessageAttachment } from '@orbi/shared';
import { useQueryClient } from '@tanstack/react-query';
import {
	DefaultChatTransport,
	lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';
import { useRef, useState } from 'react';
import {
	isRejectedRequest,
	type ChatContext,
	type TutorUIMessage,
} from './chat';
import { questionSetsKey } from '@/features/questions/set-hooks';
import { usageKey } from '@/features/usage/hooks';
import { chatKey, courseChatsKey } from './query-keys';

// The chat with the tutor. Only the newest message goes to the server, which keeps
// the history; every request also says which course, topic, model, and action it is for.
export function useTutorChat({
	chatId,
	courseId,
	initialMessages,
	fallbackContext,
	onRejected,
}: {
	chatId: string;
	courseId: string;
	initialMessages: TutorUIMessage[];
	// used until the student sends something in this visit, for example to try again
	// or to answer Orbi's question in a chat opened after a reload
	fallbackContext: ChatContext | null;
	// The server refused before starting. typed is what goes back into the composer:
	// empty when the refused request was not a new message.
	onRejected: (typed: string, error: unknown) => void;
}) {
	const queryClient = useQueryClient();
	const context = useRef<ChatContext | null>(null);
	const fallback = useRef(fallbackContext);
	fallback.current = fallbackContext;
	const lastText = useRef('');
	// true while the request is a new message; only that one is taken back when refused
	const sendingNew = useRef(false);
	const [stoppedId, setStoppedId] = useState<string | null>(null);
	const [lastContext, setLastContext] = useState<ChatContext | null>(null);
	const [transport] = useState(
		() =>
			new DefaultChatTransport<TutorUIMessage>({
				api: `/api/chats/${chatId}/messages`,
				prepareSendMessagesRequest: ({ messages, trigger }) => ({
					body: {
						...(context.current ?? fallback.current),
						trigger,
						message: trigger === 'submit-message' ? messages.at(-1) : undefined,
						attachments:
							trigger === 'submit-message'
								? (messages.at(-1)?.metadata?.attachments ?? [])
								: [],
					},
				}),
			})
	);

	const chat = useChat<TutorUIMessage>({
		id: chatId,
		messages: initialMessages,
		transport,
		generateId: () => crypto.randomUUID(),
		// an answer to askStudent goes back by itself, so the reply can go on
		sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
		experimental_throttle: 40,
		onFinish: ({ message, isAbort }) => {
			setStoppedId(isAbort ? message.id : null);
			void queryClient.invalidateQueries({
				queryKey: courseChatsKey(courseId),
			});
			void queryClient.invalidateQueries({ queryKey: chatKey(chatId) });
			// a reply can make a question set for the Study pane
			void queryClient.invalidateQueries({
				queryKey: questionSetsKey(courseId),
			});
			// the reply used AI, so the usage meter and warnings move on
			void queryClient.invalidateQueries({ queryKey: usageKey });
		},
		onError: (error) => {
			// a refused reply can mean a limit was reached
			void queryClient.invalidateQueries({ queryKey: usageKey });
			if (!isRejectedRequest(error)) return;
			if (!sendingNew.current) {
				onRejected('', error);
				return;
			}
			chat.setMessages((messages) =>
				messages.at(-1)?.role === 'user' ? messages.slice(0, -1) : messages
			);
			onRejected(lastText.current, error);
		},
	});

	return {
		...chat,
		stoppedId,
		// what the last request was for, to say what Orbi is working on
		context: lastContext,
		// typed is what the student wrote; text can be a message written for them, which
		// must not go back into the composer as if they had typed it
		// the attached PDFs go with the message, so it shows them at once
		send: (
			text: string,
			next: ChatContext,
			typed: string,
			attachments: MessageAttachment[] = []
		) => {
			context.current = next;
			setLastContext(next);
			lastText.current = typed;
			sendingNew.current = true;
			chat.clearError();
			void chat.sendMessage({
				text,
				metadata:
					attachments.length > 0
						? {
								topicId: next.topicId,
								action: next.action,
								attachments,
								createdAt: new Date().toISOString(),
							}
						: undefined,
			});
		},
		// a failed reply is dropped and asked for again; a message that never got an
		// answer is sent again
		retry: () => {
			sendingNew.current = false;
			chat.clearError();
			if (chat.messages.at(-1)?.role === 'user') void chat.sendMessage();
			else void chat.regenerate();
		},
		answer: (toolCallId: string, output: AskStudentOutput) => {
			sendingNew.current = false;
			void chat.addToolOutput({ tool: 'askStudent', toolCallId, output });
		},
	};
}

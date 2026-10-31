'use client';

import { useChat } from '@ai-sdk/react';
import {
	aiModels,
	chatMessagesPage,
	chatSummary,
	chatThread,
	type AskStudentOutput,
} from '@orbi/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	DefaultChatTransport,
	lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type DragEvent,
} from 'react';
import { z } from 'zod';
import { api } from '@/lib/api';
import {
	attachmentError,
	attachmentKind,
	type Attachment,
} from './attachments';
import {
	fromChatMessage,
	isRejectedRequest,
	type ChatContext,
	type TutorUIMessage,
} from './chat';
import { uploadAttachment } from './mock-upload';
import { chatKey, courseChatsKey, modelsKey } from './query-keys';

// the models the server can use; they change only when the server is set up again
export function useModels() {
	return useQuery({
		queryKey: modelsKey,
		queryFn: () => api.get('/models', aiModels),
		staleTime: Infinity,
	});
}

// One scope's chat (a topic, or the whole course): it opens on that scope's latest
// chat, and a new newChatVersion starts an empty one
export function useScopeChat({
	courseId,
	topicId,
	newChatVersion,
}: {
	courseId: string;
	topicId: string | null;
	newChatVersion: number;
}) {
	const chats = useQuery({
		queryKey: courseChatsKey(courseId),
		queryFn: () => api.get(`/courses/${courseId}/chats`, z.array(chatSummary)),
	});
	const [firstNewId] = useState(() => crypto.randomUUID());
	// fixed once chosen, so the open chat never changes under the student when the
	// list reloads after a reply
	const [picked, setPicked] = useState<PickedChat | null>(null);
	const latest = chats.data?.find((chat) => chat.topicId === topicId);
	const initial: PickedChat | null = chats.data
		? latest
			? { id: latest.id, isNew: false }
			: { id: firstNewId, isNew: true }
		: null;
	const current = picked ?? initial;
	useEffect(() => {
		if (!picked && initial) setPicked(initial);
	}, [picked, initial?.id]);

	useEffect(() => {
		if (newChatVersion > 0) {
			setPicked({ id: crypto.randomUUID(), isNew: true });
		}
	}, [newChatVersion]);

	const thread = useQuery({
		queryKey: chatKey(current?.id ?? ''),
		queryFn: () => api.get(`/chats/${current!.id}`, chatThread),
		enabled: current !== null && !current.isNew,
	});

	return {
		chatId: current?.id ?? firstNewId,
		isPending: !current || (!current.isNew && thread.isPending),
		error: chats.error ?? thread.error,
		retry: () => (chats.isError ? chats.refetch() : thread.refetch()),
		messages:
			current && !current.isNew
				? (thread.data?.messages.map(fromChatMessage) ?? [])
				: [],
		hasEarlier: (current && !current.isNew && thread.data?.hasEarlier) ?? false,
	};
}

// the page of messages before one message, for scrolling back in a long chat
export function useEarlierMessages(chatId: string) {
	return useCallback(
		async (beforeId: string) => {
			const page = await api.get(
				`/chats/${chatId}/messages?before=${beforeId}`,
				chatMessagesPage
			);
			return {
				messages: page.messages.map(fromChatMessage),
				hasEarlier: page.hasEarlier,
			};
		},
		[chatId]
	);
}

type PickedChat = { id: string; isNew: boolean };

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
		},
		onError: (error) => {
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
		send: (text: string, next: ChatContext, typed: string) => {
			context.current = next;
			setLastContext(next);
			lastText.current = typed;
			sendingNew.current = true;
			chat.clearError();
			void chat.sendMessage({ text });
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

export function useUploadAttachment() {
	return useMutation({ mutationFn: uploadAttachment });
}

// the files attached to the note composer, each uploading on its own
export function useAttachments() {
	const [attachments, setAttachments] = useState<Attachment[]>([]);
	const uploads = useRef(new Map<string, AbortController>());
	const nextId = useRef(0);
	const { mutateAsync: upload } = useUploadAttachment();

	const update = (id: string, changes: Partial<Attachment>) =>
		setAttachments((current) =>
			current.map((item) => (item.id === id ? { ...item, ...changes } : item))
		);

	const startUpload = (attachment: Attachment) => {
		const controller = new AbortController();
		uploads.current.set(attachment.id, controller);
		upload({
			file: attachment.file,
			signal: controller.signal,
			onProgress: (progress) => update(attachment.id, { progress }),
		})
			.then(() => update(attachment.id, { status: 'ready', progress: 1 }))
			.catch(() => {
				// removed by the user, so there is nothing to show
				if (controller.signal.aborted) return;
				update(attachment.id, {
					status: 'error',
					error: 'Upload failed',
				});
			})
			.finally(() => uploads.current.delete(attachment.id));
	};

	const add = (files: File[]) => {
		const added = files.map((file): Attachment => {
			const kind = attachmentKind(file);
			const error = attachmentError(file, kind) ?? undefined;
			nextId.current += 1;
			return {
				id: String(nextId.current),
				file,
				kind,
				status: error ? 'error' : 'uploading',
				progress: 0,
				error,
			};
		});
		setAttachments((current) => [...current, ...added]);
		added
			.filter((attachment) => attachment.status === 'uploading')
			.forEach(startUpload);
	};

	const remove = (id: string) => {
		uploads.current.get(id)?.abort();
		setAttachments((current) => current.filter((item) => item.id !== id));
	};

	// stops uploads that are still running when the page is left
	useEffect(() => {
		const running = uploads.current;
		return () => running.forEach((controller) => controller.abort());
	}, []);

	return { attachments, add, remove };
}

const hasFiles = (event: DragEvent | globalThis.DragEvent) =>
	event.dataTransfer?.types.includes('Files') ?? false;

// lets files be dropped on one element; a file dropped anywhere else on the page
// is ignored, instead of the browser opening it and leaving the page
export function useFileDrop(onFiles: (files: File[]) => void) {
	const [isDragging, setIsDragging] = useState(false);
	// dragenter and dragleave also fire for every child, so they are counted
	const depth = useRef(0);

	useEffect(() => {
		const ignore = (event: globalThis.DragEvent) => {
			if (hasFiles(event)) event.preventDefault();
		};
		window.addEventListener('dragover', ignore);
		window.addEventListener('drop', ignore);
		return () => {
			window.removeEventListener('dragover', ignore);
			window.removeEventListener('drop', ignore);
		};
	}, []);

	const stop = () => {
		depth.current = 0;
		setIsDragging(false);
	};

	const dropZoneProps = {
		onDragEnter: (event: DragEvent) => {
			if (!hasFiles(event)) return;
			event.preventDefault();
			depth.current += 1;
			setIsDragging(true);
		},
		onDragOver: (event: DragEvent) => {
			if (!hasFiles(event)) return;
			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';
		},
		onDragLeave: (event: DragEvent) => {
			if (!hasFiles(event)) return;
			depth.current -= 1;
			if (depth.current <= 0) stop();
		},
		onDrop: (event: DragEvent) => {
			if (!hasFiles(event)) return;
			event.preventDefault();
			stop();
			onFiles(Array.from(event.dataTransfer.files));
		},
	};

	return { isDragging, dropZoneProps };
}

'use client';

import { useChat } from '@ai-sdk/react';
import {
	aiModels,
	chatMessagesPage,
	chatSummary,
	chatThread,
	FOLLOW_UPS_MAX,
	followUps,
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
import { useUploadPdf } from '@/features/notes/hooks';
import { api, apiErrorMessage } from '@/lib/api';
import {
	attachmentError,
	attachmentKind,
	noTopicError,
	type Attachment,
} from './attachments';
import {
	fromChatMessage,
	isRejectedRequest,
	scopeTopicId,
	type ChatContext,
	type TutorUIMessage,
} from './chat';
import {
	openChat,
	scopeChatList,
	startNewChat,
	startScope,
	type OpenChat,
	type ScopeChats,
} from './open-chats';
import { chatKey, courseChatsKey, followUpsKey, modelsKey } from './query-keys';

// the models the server can use; they change only when the server is set up again
export function useModels() {
	return useQuery({
		queryKey: modelsKey,
		queryFn: () => api.get('/models', aiModels),
		staleTime: Infinity,
	});
}

// every chat of the course, newest first (the server sends the newest 50)
export function useCourseChats(courseId: string) {
	return useQuery({
		queryKey: courseChatsKey(courseId),
		queryFn: () => api.get(`/courses/${courseId}/chats`, z.array(chatSummary)),
	});
}

// one chat's newest messages; a new chat has none to load yet
export function useChatThread(chat: OpenChat) {
	const thread = useQuery({
		queryKey: chatKey(chat.id),
		queryFn: () => api.get(`/chats/${chat.id}`, chatThread),
		enabled: !chat.isNew,
	});
	return {
		isPending: !chat.isNew && thread.isPending,
		error: thread.error,
		retry: () => thread.refetch(),
		messages: chat.isNew
			? []
			: (thread.data?.messages.map(fromChatMessage) ?? []),
		hasEarlier: (!chat.isNew && thread.data?.hasEarlier) ?? false,
	};
}

// The chats each scope (a topic, or the whole course) opened in this visit. A scope
// opens on its latest chat; once picked it is fixed, so the open chat never changes
// under the student when the list reloads after a reply.
export function useOpenChats(courseId: string, scopes: string[]) {
	const list = useCourseChats(courseId);
	const [picked, setPicked] = useState<Record<string, ScopeChats>>({});
	// the id of each scope's first new chat, so it stays the same until it is picked
	const [newIds] = useState(() => new Map<string, string>());
	const newIdFor = (scope: string) => {
		if (!newIds.has(scope)) newIds.set(scope, crypto.randomUUID());
		return newIds.get(scope)!;
	};
	const chatsOf = (scope: string): ScopeChats | undefined =>
		picked[scope] ??
		(list.data && startScope(list.data, scopeTopicId(scope), newIdFor(scope)));

	useEffect(() => {
		if (!list.data) return;
		const missing = scopes.filter((scope) => !picked[scope]);
		if (missing.length === 0) return;
		setPicked((current) => ({
			...current,
			...Object.fromEntries(missing.map((scope) => [scope, chatsOf(scope)!])),
		}));
	}, [list.data, scopes.join(), picked]);

	const update = (scope: string, change: (state: ScopeChats) => ScopeChats) => {
		const state = chatsOf(scope);
		if (state) setPicked((current) => ({ ...current, [scope]: change(state) }));
	};

	return {
		list,
		chatsOf,
		// the scope's saved chats, for the list of earlier chats
		savedChats: (scope: string) =>
			scopeChatList(list.data ?? [], scopeTopicId(scope)),
		open: (scope: string, chatId: string) =>
			update(scope, (state) => openChat(state, chatId)),
		startNew: (scope: string) =>
			update(scope, (state) => startNewChat(state, crypto.randomUUID())),
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

// Up to 3 questions that go deeper into Orbi's latest reply. Saved ones come with the
// chat, so nothing is asked. A refresh asks for new ones, and leaves out every
// question shown so far.
export function useFollowUps(
	chatId: string,
	messageId: string,
	saved: string[] | undefined
) {
	const queryClient = useQueryClient();
	const key = followUpsKey(chatId, messageId);
	const url = `/chats/${chatId}/messages/${messageId}/follow-ups`;
	const shown = useRef<string[]>([]);

	const suggestions = useQuery({
		queryKey: key,
		queryFn: () => api.post(url, followUps, { exclude: [] }),
		initialData: saved && { questions: saved },
		staleTime: Infinity,
		retry: false,
	});
	const refresh = useMutation({
		mutationFn: () => {
			shown.current = [
				...shown.current,
				...(suggestions.data?.questions ?? []),
			].slice(-FOLLOW_UPS_MAX * 4);
			return api.post(url, followUps, { exclude: shown.current });
		},
		onSuccess: (data) => {
			queryClient.setQueryData(key, data);
			// the chat has the new ones saved now
			void queryClient.invalidateQueries({ queryKey: chatKey(chatId) });
		},
	});

	return {
		questions: suggestions.data?.questions ?? [],
		isLoading: suggestions.isPending,
		isRefreshing: refresh.isPending,
		error: refresh.error ?? suggestions.error,
		refresh: () => refresh.mutate(),
	};
}

// where attached PDFs are saved: a topic of the course, or null when no topic
// is picked (the whole-course chat)
export type AttachmentTarget = { courseId: string; topicId: string } | null;

// the files attached to the note composer, each uploading on its own and saved
// as notes of the target topic
export function useAttachments(target: AttachmentTarget) {
	const [attachments, setAttachments] = useState<Attachment[]>([]);
	const uploads = useRef(new Map<string, AbortController>());
	const nextId = useRef(0);
	const { mutateAsync: upload } = useUploadPdf();

	const update = (id: string, changes: Partial<Attachment>) =>
		setAttachments((current) =>
			current.map((item) => (item.id === id ? { ...item, ...changes } : item))
		);

	const startUpload = (
		attachment: Attachment,
		{ courseId, topicId }: NonNullable<AttachmentTarget>
	) => {
		const controller = new AbortController();
		uploads.current.set(attachment.id, controller);
		upload({
			courseId,
			topicId,
			file: attachment.file,
			signal: controller.signal,
			onProgress: (progress) => update(attachment.id, { progress }),
		})
			.then(() => update(attachment.id, { status: 'ready', progress: 1 }))
			.catch((error: unknown) => {
				// removed by the user, so there is nothing to show
				if (controller.signal.aborted) return;
				update(attachment.id, {
					status: 'error',
					error: 'Not saved',
					errorDetail: apiErrorMessage(error),
				});
			})
			.finally(() => uploads.current.delete(attachment.id));
	};

	const add = (files: File[]) => {
		const added = files.map((file): Attachment => {
			const kind = attachmentKind(file);
			const fileError = attachmentError(file, kind);
			const problem = fileError
				? { error: fileError }
				: target
					? {}
					: noTopicError;
			nextId.current += 1;
			return {
				id: String(nextId.current),
				file,
				kind,
				status: problem.error ? 'error' : 'uploading',
				progress: 0,
				...problem,
			};
		});
		setAttachments((current) => [...current, ...added]);
		if (!target) return;
		added
			.filter((attachment) => attachment.status === 'uploading')
			.forEach((attachment) => startUpload(attachment, target));
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

	// after a send the saved files are done: their text is in the notes now
	const clearSaved = () =>
		setAttachments((current) =>
			current.filter((item) => item.status !== 'ready')
		);

	return { attachments, add, remove, clearSaved };
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

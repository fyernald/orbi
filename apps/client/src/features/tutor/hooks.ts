'use client';

import {
	aiModels,
	chatMessagesPage,
	chatSummary,
	chatThread,
	FOLLOW_UPS_MAX,
	followUps,
	type ChatSummary,
	type ChatThread,
} from '@orbi/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { z } from 'zod';
import { api } from '@/lib/api';
import { fromChatMessage } from './chat';
import type { OpenChat } from './open-chats';
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

// the new name shows in the list of chats at once
export function useRenameChat(courseId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ chatId, title }: { chatId: string; title: string }) =>
			api.patch(`/chats/${chatId}`, chatSummary, { title }),
		onSuccess: (renamed) => {
			queryClient.setQueryData<ChatSummary[]>(
				courseChatsKey(courseId),
				(chats) =>
					chats?.map((chat) => (chat.id === renamed.id ? renamed : chat))
			);
			queryClient.setQueryData<ChatThread>(
				chatKey(renamed.id),
				(thread) => thread && { ...thread, title: renamed.title }
			);
		},
	});
}

// onDeleted moves the student off the chat before its data goes, so the open chat
// does not try to load it again
export function useDeleteChat(
	courseId: string,
	onDeleted: (chatId: string) => void
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (chatId: string) => api.delete(`/chats/${chatId}`),
		onSuccess: (_, chatId) => {
			onDeleted(chatId);
			queryClient.setQueryData<ChatSummary[]>(
				courseChatsKey(courseId),
				(chats) => chats?.filter((chat) => chat.id !== chatId)
			);
			queryClient.removeQueries({ queryKey: chatKey(chatId) });
		},
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

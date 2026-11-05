'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import { scopeTopicId } from './chat';
import { useCourseChats } from './hooks';
import {
	openChat,
	scopeChatList,
	startNewChat,
	startScope,
	type ScopeChats,
} from './open-chats';

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

	const pickMissing = useEffectEvent(() => {
		if (!list.data) return;
		const missing = scopes.filter((scope) => !picked[scope]);
		if (missing.length === 0) return;
		setPicked((current) => ({
			...current,
			...Object.fromEntries(missing.map((scope) => [scope, chatsOf(scope)!])),
		}));
	});
	const scopeKey = scopes.join();
	useEffect(() => {
		pickMissing();
	}, [list.data, scopeKey, picked]);

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

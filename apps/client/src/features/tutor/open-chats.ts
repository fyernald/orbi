import type { ChatSummary } from '@orbi/shared';

// a chat opened in this visit; a new one is not saved until its first message
export type OpenChat = { id: string; isNew: boolean };

// The chats one scope (a topic, or the whole course) opened in this visit. They all
// stay mounted, so a reply keeps streaming while the student reads another chat.
export type ScopeChats = { open: OpenChat[]; currentId: string };

// the scope's saved chats, newest first, as the server lists them
export const scopeChatList = (chats: ChatSummary[], topicId: string | null) =>
	chats.filter((chat) => chat.topicId === topicId);

// a scope opens on its latest chat, or on a new one when it has none
export function startScope(
	chats: ChatSummary[],
	topicId: string | null,
	newId: string
): ScopeChats {
	const latest = scopeChatList(chats, topicId)[0];
	const first = latest
		? { id: latest.id, isNew: false }
		: { id: newId, isNew: true };
	return { open: [first], currentId: first.id };
}

// shows a saved chat, opening it if this visit has not yet
export function openChat(state: ScopeChats, id: string): ScopeChats {
	const isOpen = state.open.some((chat) => chat.id === id);
	return {
		open: isOpen ? state.open : [...state.open, { id, isNew: false }],
		currentId: id,
	};
}

export const startNewChat = (state: ScopeChats, id: string): ScopeChats => ({
	open: [...state.open, { id, isNew: true }],
	currentId: id,
});

import type { ChatSummary } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import {
	closeChat,
	openChat,
	scopeChatList,
	startNewChat,
	startScope,
} from './open-chats';

const chat = (id: string, topicId: string | null): ChatSummary => ({
	id,
	courseId: 'course',
	topicId,
	title: `Chat ${id}`,
	updatedAt: '2026-11-02T10:00:00.000Z',
});

// newest first, as the server sends them
const chats = [
	chat('mitosis-2', 'mitosis'),
	chat('course-1', null),
	chat('mitosis-1', 'mitosis'),
];

describe('scopeChatList', () => {
	it("keeps a topic's chats, newest first", () => {
		expect(scopeChatList(chats, 'mitosis').map(({ id }) => id)).toEqual([
			'mitosis-2',
			'mitosis-1',
		]);
	});

	it('keeps the whole-course chats apart from the topics', () => {
		expect(scopeChatList(chats, null).map(({ id }) => id)).toEqual([
			'course-1',
		]);
	});
});

describe('startScope', () => {
	it('opens on the latest chat', () => {
		expect(startScope(chats, 'mitosis', 'new')).toEqual({
			open: [{ id: 'mitosis-2', isNew: false }],
			currentId: 'mitosis-2',
		});
	});

	it('opens a new chat when the scope has none', () => {
		expect(startScope(chats, 'meiosis', 'new')).toEqual({
			open: [{ id: 'new', isNew: true }],
			currentId: 'new',
		});
	});
});

describe('openChat', () => {
	const start = startScope(chats, 'mitosis', 'new');

	it('opens an earlier chat and keeps the other one open', () => {
		expect(openChat(start, 'mitosis-1')).toEqual({
			open: [
				{ id: 'mitosis-2', isNew: false },
				{ id: 'mitosis-1', isNew: false },
			],
			currentId: 'mitosis-1',
		});
	});

	it('goes back to a chat that is already open without opening it twice', () => {
		const back = openChat(openChat(start, 'mitosis-1'), 'mitosis-2');

		expect(back.open).toHaveLength(2);
		expect(back.currentId).toBe('mitosis-2');
	});

	it('goes back to a new chat by its id', () => {
		const withNew = startNewChat(start, 'new');

		expect(openChat(withNew, 'new').open).toEqual(withNew.open);
	});
});

describe('startNewChat', () => {
	it('starts an empty chat and keeps the old one open', () => {
		expect(startNewChat(startScope(chats, 'mitosis', 'a'), 'b')).toEqual({
			open: [
				{ id: 'mitosis-2', isNew: false },
				{ id: 'b', isNew: true },
			],
			currentId: 'b',
		});
	});
});

describe('closeChat', () => {
	const mitosis = scopeChatList(chats, 'mitosis');

	it('opens the next newest chat when the one shown is deleted', () => {
		const start = startScope(chats, 'mitosis', 'new');

		expect(closeChat(start, 'mitosis-2', mitosis, 'new')).toEqual({
			open: [{ id: 'mitosis-1', isNew: false }],
			currentId: 'mitosis-1',
		});
	});

	it('opens an empty chat when the deleted one was the last', () => {
		const start = startScope(chats, null, 'unused');

		expect(
			closeChat(start, 'course-1', scopeChatList(chats, null), 'new')
		).toEqual({ open: [{ id: 'new', isNew: true }], currentId: 'new' });
	});

	it('goes to a new chat that is already open instead of starting another', () => {
		const withNew = openChat(
			startNewChat(startScope(chats, null, 'unused'), 'empty'),
			'course-1'
		);

		expect(
			closeChat(withNew, 'course-1', scopeChatList(chats, null), 'other')
		).toEqual({ open: [{ id: 'empty', isNew: true }], currentId: 'empty' });
	});

	it('keeps showing the current chat when another open one is deleted', () => {
		const both = openChat(startScope(chats, 'mitosis', 'new'), 'mitosis-1');

		expect(closeChat(both, 'mitosis-2', mitosis, 'new')).toEqual({
			open: [{ id: 'mitosis-1', isNew: false }],
			currentId: 'mitosis-1',
		});
	});
});

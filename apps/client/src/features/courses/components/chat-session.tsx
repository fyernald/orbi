'use client';

import type { Course } from '@orbi/shared';
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { LoadError } from '@/components/load-error';
import { TutorChat } from '@/features/tutor/components/chat/tutor-chat';
import type {
	ComposerDraft,
	ComposerPreset,
} from '@/features/tutor/components/note-composer';
import type { ComposerTopic } from '@/features/tutor/composer';
import { useChatThread } from '@/features/tutor/hooks';
import type { OpenChat } from '@/features/tutor/open-chats';
import { apiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { ChatLoading } from './chat-loading';

type ChatSessionProps = {
	chat: OpenChat;
	course: Course;
	// the topic the chat belongs to, or null for the whole-course chat
	topicId: string | null;
	topics: ComposerTopic[];
	// hidden chats stay mounted, so their replies keep streaming and drafts stay
	visible: boolean;
	// false for the chat the page opens on
	focusOnOpen: boolean;
	preset: ComposerPreset | undefined;
	emptyState: ReactNode;
	limitReason: string | null;
	onHasMessages: (chatId: string, hasMessages: boolean) => void;
	onBusyChange: (chatId: string, busy: boolean) => void;
	onSwitchTopic: (topicId: string | null, draft: ComposerDraft) => void;
	onAddTopic: () => void;
};

// one chat with the tutor: its saved messages, then the live chat
export function ChatSession({
	chat,
	course,
	topicId,
	topics,
	visible,
	focusOnOpen,
	preset,
	emptyState,
	limitReason,
	onHasMessages,
	onBusyChange,
	onSwitchTopic,
	onAddTopic,
}: ChatSessionProps) {
	const thread = useChatThread(chat);
	const hasMessages = useCallback(
		(value: boolean) => onHasMessages(chat.id, value),
		[chat.id, onHasMessages]
	);
	const busy = useCallback(
		(value: boolean) => onBusyChange(chat.id, value),
		[chat.id, onBusyChange]
	);

	// A chat the student opens is ready to type in once it has loaded. The chat the
	// page opens on is not, or a phone would open its keyboard by itself.
	const container = useRef<HTMLDivElement>(null);
	const focusWhenReady = useRef(focusOnOpen);
	useEffect(() => {
		if (!visible) {
			focusWhenReady.current = true;
			return;
		}
		if (!focusWhenReady.current || thread.isPending) return;
		focusWhenReady.current = false;
		container.current
			?.querySelector('textarea')
			?.focus({ preventScroll: true });
	}, [visible, thread.isPending]);

	return (
		<div
			ref={container}
			className={cn('flex min-h-0 flex-1 flex-col', !visible && 'hidden')}
			// nothing inside a hidden chat should be reached by keyboard or read out
			inert={!visible}
		>
			{thread.error ? (
				<div className="mx-auto w-full max-w-chat flex-1 px-5 py-10">
					<LoadError
						message={apiErrorMessage(thread.error)}
						onRetry={() => void thread.retry()}
					/>
				</div>
			) : thread.isPending ? (
				<ChatLoading />
			) : (
				<TutorChat
					chatId={chat.id}
					courseId={course.id}
					courseName={course.name}
					chatTopicId={topicId}
					initialMessages={thread.messages}
					initialHasEarlier={thread.hasEarlier}
					topics={topics}
					preset={preset}
					emptyState={emptyState}
					limitReason={limitReason}
					onHasMessages={hasMessages}
					onBusyChange={busy}
					onSwitchTopic={onSwitchTopic}
					onAddTopic={onAddTopic}
				/>
			)}
		</div>
	);
}

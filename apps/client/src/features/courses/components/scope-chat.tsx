'use client';

import type { Course, Topic } from '@orbi/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LoadError } from '@/components/load-error';
import { AddNotesPrompt } from '@/features/notes/components/add-notes-prompt';
import { scopeTopicId } from '@/features/tutor/chat';
import { ChatSkeleton } from '@/features/tutor/components/chat/chat-skeleton';
import { TutorChat } from '@/features/tutor/components/chat/tutor-chat';
import type {
	ComposerDraft,
	ComposerPreset,
} from '@/features/tutor/components/note-composer';
import { useScopeChat } from '@/features/tutor/hooks';
import { apiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { tutorStarters, type TutorStarter } from '../tutor-starters';
import { TutorStarterList } from './tutor-starter-list';

type ScopeChatProps = {
	course: Course;
	topics: Topic[];
	// a topic id, or the whole-course scope
	scope: string;
	// hidden chats stay mounted, so their replies keep streaming and drafts stay
	active: boolean;
	preset: ComposerPreset | undefined;
	newChatVersion: number;
	limitReason: string | null;
	// false for the chat the page opens on
	focusOnOpen: boolean;
	onStart: (starter: Omit<TutorStarter, 'label'>) => void;
	onOpenNotes: (topicId: string) => void;
	onHasMessages: (scope: string, hasMessages: boolean) => void;
	onBusyChange: (scope: string, busy: boolean) => void;
	onSwitchTopic: (topicId: string | null, draft: ComposerDraft) => void;
};

// the chat of one topic, or of the whole course
export function ScopeChat({
	course,
	topics,
	scope,
	active,
	preset,
	newChatVersion,
	limitReason,
	focusOnOpen,
	onStart,
	onOpenNotes,
	onHasMessages,
	onBusyChange,
	onSwitchTopic,
}: ScopeChatProps) {
	const topicId = scopeTopicId(scope);
	const topic = topics.find(({ id }) => id === topicId);
	const session = useScopeChat({
		courseId: course.id,
		topicId,
		newChatVersion,
	});
	const hasMessages = useCallback(
		(value: boolean) => onHasMessages(scope, value),
		[scope, onHasMessages]
	);
	// a new chat starts empty, without the preset the old one already used
	const [usedPreset, setUsedPreset] = useState({ chat: 0, version: 0 });
	if (usedPreset.chat !== newChatVersion) {
		setUsedPreset({ chat: newChatVersion, version: preset?.version ?? 0 });
	}
	const freshPreset =
		preset && preset.version > usedPreset.version ? preset : undefined;
	// A chat the student opens (from the topic list or the message box) is ready to
	// type in once it has loaded. The chat the page opens on is not, or a phone would
	// open its keyboard by itself.
	const container = useRef<HTMLDivElement>(null);
	const focusWhenReady = useRef(focusOnOpen);
	useEffect(() => {
		if (!active) {
			focusWhenReady.current = true;
			return;
		}
		if (!focusWhenReady.current || session.isPending) return;
		focusWhenReady.current = false;
		container.current
			?.querySelector('textarea')
			?.focus({ preventScroll: true });
	}, [active, session.isPending]);

	const busy = useCallback(
		(value: boolean) => onBusyChange(scope, value),
		[scope, onBusyChange]
	);

	// the composer lists every topic: picking one opens that topic's chat
	const chatTopics = topic ? [topic] : topics;
	const composerTopics = topics.map(({ id, name }) => ({
		id,
		course: course.name,
		name,
	}));

	const emptyState = (
		<div className="mx-auto flex w-full max-w-chat flex-col gap-8 px-5 py-10">
			{topic?.noteCount === 0 && (
				<AddNotesPrompt
					topicName={topic.name}
					onAddNotes={() => onOpenNotes(topic.id)}
				/>
			)}
			<TutorStarterList
				starters={tutorStarters(course, chatTopics)}
				onStart={onStart}
			/>
		</div>
	);

	return (
		<div
			ref={container}
			className={cn('flex min-h-0 flex-1 flex-col', !active && 'hidden')}
			// nothing inside a hidden chat should be reached by keyboard or read out
			inert={!active}
		>
			{session.error ? (
				<div className="mx-auto w-full max-w-chat flex-1 px-5 py-10">
					<LoadError
						message={apiErrorMessage(session.error)}
						onRetry={() => void session.retry()}
					/>
				</div>
			) : session.isPending ? (
				<ChatLoading />
			) : (
				<TutorChat
					key={session.chatId}
					chatId={session.chatId}
					courseId={course.id}
					chatTopicId={topicId}
					initialMessages={session.messages}
					initialHasEarlier={session.hasEarlier}
					topics={composerTopics}
					preset={freshPreset}
					emptyState={emptyState}
					limitReason={limitReason}
					onHasMessages={hasMessages}
					onBusyChange={busy}
					onSwitchTopic={onSwitchTopic}
				/>
			)}
		</div>
	);
}

// the chat's shape, with the composer's place kept, while its messages load
export function ChatLoading() {
	return (
		<div
			role="status"
			aria-label="Loading the chat"
			className="flex min-h-0 flex-1 flex-col"
		>
			<div className="min-h-0 flex-1 overflow-hidden">
				<ChatSkeleton className="mx-auto w-full max-w-chat px-5 py-8" />
			</div>
			<div className="shrink-0 px-4 pb-4">
				<div className="mx-auto h-34 w-full max-w-chat animate-pulse rounded-3xl border border-border bg-card motion-reduce:animate-none" />
			</div>
		</div>
	);
}

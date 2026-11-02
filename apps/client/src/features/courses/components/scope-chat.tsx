'use client';

import type { Course, Topic } from '@orbi/shared';
import { useCallback, useState } from 'react';
import { AddNotesPrompt } from '@/features/notes/components/add-notes-prompt';
import { scopeTopicId } from '@/features/tutor/chat';
import type {
	ComposerDraft,
	ComposerPreset,
} from '@/features/tutor/components/note-composer';
import type { ScopeChats } from '@/features/tutor/open-chats';
import { cn } from '@/lib/utils';
import { tutorStarters, type TutorStarter } from '../tutor-starters';
import { ChatSession } from './chat-session';
import { TutorStarterList } from './tutor-starter-list';

type ScopeChatProps = {
	course: Course;
	topics: Topic[];
	// a topic id, or the whole-course scope
	scope: string;
	// the chats of this scope opened in this visit, and the one that shows
	chats: ScopeChats;
	// hidden scopes stay mounted, so their replies keep streaming and drafts stay
	active: boolean;
	preset: ComposerPreset | undefined;
	// why a chat cannot send now, like the limit on parallel replies
	limitReasonFor: (chatId: string) => string | null;
	// false for the scope the page opens on
	focusOnOpen: boolean;
	onStart: (starter: Omit<TutorStarter, 'label'>) => void;
	onOpenNotes: (topicId: string) => void;
	onHasMessages: (chatId: string, hasMessages: boolean) => void;
	onBusyChange: (chatId: string, scope: string, busy: boolean) => void;
	onSwitchTopic: (topicId: string | null, draft: ComposerDraft) => void;
	onAddTopic: () => void;
};

// the chats of one topic, or of the whole course
export function ScopeChat({
	course,
	topics,
	scope,
	chats,
	active,
	preset,
	limitReasonFor,
	focusOnOpen,
	onStart,
	onOpenNotes,
	onHasMessages,
	onBusyChange,
	onSwitchTopic,
	onAddTopic,
}: ScopeChatProps) {
	const topicId = scopeTopicId(scope);
	const topic = topics.find(({ id }) => id === topicId);
	// another chat starts without the preset the last one already used
	const [usedPreset, setUsedPreset] = useState({
		chatId: chats.currentId,
		version: 0,
	});
	if (usedPreset.chatId !== chats.currentId) {
		setUsedPreset({ chatId: chats.currentId, version: preset?.version ?? 0 });
	}
	const freshPreset =
		preset && preset.version > usedPreset.version ? preset : undefined;
	// stays the same between renders: a chat reports busy again when it changes
	const busy = useCallback(
		(chatId: string, value: boolean) => onBusyChange(chatId, scope, value),
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
		<div className={cn('flex min-h-0 flex-1 flex-col', !active && 'hidden')}>
			{chats.open.map((chat, index) => {
				const current = chat.id === chats.currentId;
				return (
					<ChatSession
						key={chat.id}
						chat={chat}
						course={course}
						topicId={topicId}
						topics={composerTopics}
						visible={active && current}
						// a chat opened from the list is ready to type in
						focusOnOpen={focusOnOpen || index > 0}
						preset={current ? freshPreset : undefined}
						emptyState={emptyState}
						limitReason={limitReasonFor(chat.id)}
						onHasMessages={onHasMessages}
						onBusyChange={busy}
						onSwitchTopic={onSwitchTopic}
						onAddTopic={onAddTopic}
					/>
				);
			})}
		</div>
	);
}

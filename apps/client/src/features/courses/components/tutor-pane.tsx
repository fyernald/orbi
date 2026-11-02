'use client';

import { MAX_PARALLEL_REPLIES, type Course, type Topic } from '@orbi/shared';
import {
	GraduationCap,
	NotebookPen,
	PanelLeft,
	PanelRight,
	SquarePen,
	X,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { LoadError } from '@/components/load-error';
import { Button } from '@/components/ui/button';
import { COURSE_SCOPE, scopeOf } from '@/features/tutor/chat';
import { useOpenChats } from '@/features/tutor/hooks';
import { apiErrorMessage } from '@/lib/api';
import { topicStudyRoute } from '@/lib/routes';
import type {
	ComposerDraft,
	ComposerPreset,
} from '@/features/tutor/components/note-composer';
import type { TutorStarter } from '../tutor-starters';
import { ChatHistoryMenu } from './chat-history-menu';
import { ChatLoading } from './chat-loading';
import { PaneHeader } from './pane-header';
import { PaneToggle } from './pane-toggle';
import { ScopeChat } from './scope-chat';

// a preset for one chat: a topic id, or the whole-course scope
export type ScopedPreset = ComposerPreset & { scope: string };

type TutorPaneProps = {
	course: Course;
	// undefined while loading; the composer waits for them to pick its first topic
	topics: Topic[] | undefined;
	selectedTopicId: string | null;
	onClearTopic: () => void;
	onOpenNotes: (topicId: string) => void;
	preset: ScopedPreset | undefined;
	onStart: (starter: Omit<TutorStarter, 'label'>) => void;
	// the chats with a reply running, and the scope of each
	busyChats: ReadonlyMap<string, string>;
	onBusyChange: (chatId: string, scope: string, busy: boolean) => void;
	onSwitchTopic: (topicId: string | null, draft: ComposerDraft) => void;
	// the message box's topic menu opens the new topic field in the topics pane
	onAddTopic: () => void;
	topicsOpen: boolean;
	onToggleTopics: () => void;
	studyOpen: boolean;
	onToggleStudy: () => void;
	className?: string;
};

// Each topic has its own chats, and the course has its own too. Every chat opened in
// this visit stays mounted, so switching topics or chats keeps a reply streaming and
// its draft.
export function TutorPane({
	course,
	topics,
	selectedTopicId,
	onClearTopic,
	onOpenNotes,
	preset,
	onStart,
	busyChats,
	onBusyChange,
	onSwitchTopic,
	onAddTopic,
	topicsOpen,
	onToggleTopics,
	studyOpen,
	onToggleStudy,
	className,
}: TutorPaneProps) {
	const activeScope = scopeOf(selectedTopicId);
	const selected = topics?.find((topic) => topic.id === selectedTopicId);
	const [opened, setOpened] = useState<string[]>([activeScope]);
	// by chat id
	const [withMessages, setWithMessages] = useState<Record<string, boolean>>({});

	useEffect(() => {
		setOpened((scopes) =>
			scopes.includes(activeScope) ? scopes : [...scopes, activeScope]
		);
	}, [activeScope]);

	const markMessages = useCallback(
		(chatId: string, value: boolean) =>
			setWithMessages((current) =>
				current[chatId] === value ? current : { ...current, [chatId]: value }
			),
		[]
	);

	// a deleted topic's chat goes away with it
	const scopes = [
		...opened.filter(
			(scope) =>
				scope === COURSE_SCOPE || topics?.some(({ id }) => id === scope)
		),
		...(opened.includes(activeScope) ? [] : [activeScope]),
	];
	const chats = useOpenChats(course.id, scopes);
	const activeChats = chats.chatsOf(activeScope);
	const savedChats = chats.savedChats(activeScope);
	const atLimit = busyChats.size >= MAX_PARALLEL_REPLIES;
	const limitReasonFor = (chatId: string) =>
		atLimit && !busyChats.has(chatId)
			? `You can have ${MAX_PARALLEL_REPLIES} replies running at once. Wait for one to finish.`
			: null;

	return (
		<section aria-labelledby="tutor-pane-title" className={className}>
			<PaneHeader
				leading={
					<PaneToggle
						label={topicsOpen ? 'Hide topics' : 'Show topics'}
						pressed={topicsOpen}
						onClick={onToggleTopics}
						icon={<PanelLeft />}
					/>
				}
				title={
					<>
						<h2 id="tutor-pane-title" className="truncate font-semibold">
							{selected ? selected.name : 'Whole course'}
						</h2>
						<span className="text-xs font-normal text-muted-foreground">
							Tutor
						</span>
						{selected && (
							<button
								type="button"
								onClick={onClearTopic}
								aria-label="Go to the whole-course chat"
								className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
							>
								<X className="size-3.5" />
							</button>
						)}
					</>
				}
				actions={
					<>
						{selected && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onOpenNotes(selected.id)}
								className="rounded-md text-muted-foreground"
							>
								<NotebookPen />
								Notes
								<span className="tabular-nums">{selected.noteCount}</span>
							</Button>
						)}
						{selected && (
							<Button
								asChild
								variant="ghost"
								size="sm"
								className="rounded-md text-muted-foreground"
							>
								<Link href={topicStudyRoute(course.id, selected.id)}>
									<GraduationCap />
									<span className="sr-only sm:not-sr-only">Study session</span>
								</Link>
							</Button>
						)}
						{activeChats && savedChats.length > 0 && (
							<ChatHistoryMenu
								chats={savedChats}
								currentId={activeChats.currentId}
								scopeName={selected ? selected.name : 'Whole course'}
								onOpen={(chatId) => chats.open(activeScope, chatId)}
							/>
						)}
						{activeChats && withMessages[activeChats.currentId] && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => chats.startNew(activeScope)}
								className="rounded-md text-muted-foreground"
							>
								<SquarePen />
								<span className="hidden sm:inline">New chat</span>
							</Button>
						)}
						<PaneToggle
							label={studyOpen ? 'Hide study tools' : 'Show study tools'}
							pressed={studyOpen}
							onClick={onToggleStudy}
							icon={<PanelRight />}
						/>
					</>
				}
			/>
			{chats.list.error ? (
				<div className="mx-auto w-full max-w-chat flex-1 px-5 py-10">
					<LoadError
						message={apiErrorMessage(chats.list.error)}
						onRetry={() => void chats.list.refetch()}
					/>
				</div>
			) : topics && chats.list.data ? (
				scopes.map((scope) => (
					<ScopeChat
						key={scope}
						course={course}
						topics={topics}
						scope={scope}
						chats={chats.chatsOf(scope)!}
						active={scope === activeScope}
						preset={preset?.scope === scope ? preset : undefined}
						focusOnOpen={scope !== opened[0]}
						limitReasonFor={limitReasonFor}
						onStart={onStart}
						onOpenNotes={onOpenNotes}
						onHasMessages={markMessages}
						onBusyChange={onBusyChange}
						onSwitchTopic={onSwitchTopic}
						onAddTopic={onAddTopic}
					/>
				))
			) : (
				<ChatLoading />
			)}
		</section>
	);
}

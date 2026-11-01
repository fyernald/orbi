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
import { Button } from '@/components/ui/button';
import { COURSE_SCOPE, scopeOf } from '@/features/tutor/chat';
import { topicStudyRoute } from '@/lib/routes';
import type {
	ComposerDraft,
	ComposerPreset,
} from '@/features/tutor/components/note-composer';
import type { TutorStarter } from '../tutor-starters';
import { PaneHeader } from './pane-header';
import { PaneToggle } from './pane-toggle';
import { ChatLoading, ScopeChat } from './scope-chat';

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
	// the chats with a reply running, by scope
	busyScopes: ReadonlySet<string>;
	onBusyChange: (scope: string, busy: boolean) => void;
	onSwitchTopic: (topicId: string | null, draft: ComposerDraft) => void;
	// the message box's topic menu opens the new topic field in the topics pane
	onAddTopic: () => void;
	topicsOpen: boolean;
	onToggleTopics: () => void;
	studyOpen: boolean;
	onToggleStudy: () => void;
	className?: string;
};

// Each topic has its own chat, and the course has one more. Every chat opened in
// this visit stays mounted, so switching topics keeps its reply streaming and its draft.
export function TutorPane({
	course,
	topics,
	selectedTopicId,
	onClearTopic,
	onOpenNotes,
	preset,
	onStart,
	busyScopes,
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
	const [newChat, setNewChat] = useState<Record<string, number>>({});
	const [withMessages, setWithMessages] = useState<Record<string, boolean>>({});

	useEffect(() => {
		setOpened((scopes) =>
			scopes.includes(activeScope) ? scopes : [...scopes, activeScope]
		);
	}, [activeScope]);

	const markMessages = useCallback(
		(scope: string, value: boolean) =>
			setWithMessages((current) =>
				current[scope] === value ? current : { ...current, [scope]: value }
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
	const atLimit = busyScopes.size >= MAX_PARALLEL_REPLIES;

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
						{withMessages[activeScope] && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									setNewChat((current) => ({
										...current,
										[activeScope]: (current[activeScope] ?? 0) + 1,
									}))
								}
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
			{topics ? (
				scopes.map((scope) => (
					<ScopeChat
						key={scope}
						course={course}
						topics={topics}
						scope={scope}
						active={scope === activeScope}
						preset={preset?.scope === scope ? preset : undefined}
						newChatVersion={newChat[scope] ?? 0}
						focusOnOpen={scope !== opened[0]}
						limitReason={
							atLimit && !busyScopes.has(scope)
								? `You can have ${MAX_PARALLEL_REPLIES} replies running at once. Wait for one to finish.`
								: null
						}
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

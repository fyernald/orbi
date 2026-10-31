'use client';

import type { Course, TutorAction } from '@orbi/shared';
import { useCallback, useState } from 'react';
import { TopicNotesSheet } from '@/features/notes/components/topic-notes-sheet';
import { COURSE_SCOPE, scopeOf } from '@/features/tutor/chat';
import type {
	ComposerDraft,
	ComposerPreset,
} from '@/features/tutor/components/note-composer';
import { apiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useTopics } from '../hooks';
import { MobilePaneTabs, type WorkspacePane } from './mobile-pane-tabs';
import { StudyPane } from './study-pane';
import { TopicsPane } from './topics-pane';
import { TutorPane, type ScopedPreset } from './tutor-pane';

// the grid for each mix of open side panes on wide screens
const columns = {
	both: 'lg:grid-cols-[17rem_minmax(0,1fr)_19rem]',
	left: 'lg:grid-cols-[17rem_minmax(0,1fr)]',
	right: 'lg:grid-cols-[minmax(0,1fr)_19rem]',
	none: 'lg:grid-cols-1',
};

// NotebookLM-style study space: topics on the left, the tutor in the middle,
// and study tools on the right. Phones show one pane at a time.
type CourseWorkspaceProps = {
	course: Course;
	start: { action?: TutorAction; message?: string };
};

export function CourseWorkspace({ course, start }: CourseWorkspaceProps) {
	const topics = useTopics(course.id);
	const [topicsOpen, setTopicsOpen] = useState(true);
	const [studyOpen, setStudyOpen] = useState(true);
	const [mobilePane, setMobilePane] = useState<WorkspacePane>('tutor');
	const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
	// the topic stays set while the sheet closes, so it can slide out with its content
	const [notesTopicId, setNotesTopicId] = useState<string | null>(null);
	const [notesOpen, setNotesOpen] = useState(false);
	const [preset, setPreset] = useState<ScopedPreset | undefined>(() =>
		start.action || start.message
			? { version: 1, scope: COURSE_SCOPE, ...start }
			: undefined
	);
	// the chats with a reply running, for the limit on parallel replies and the topic list
	const [busyScopes, setBusyScopes] = useState<ReadonlySet<string>>(
		() => new Set()
	);
	const setScopeBusy = useCallback((scope: string, busy: boolean) => {
		setBusyScopes((current) => {
			if (current.has(scope) === busy) return current;
			const next = new Set(current);
			if (busy) next.add(scope);
			else next.delete(scope);
			return next;
		});
	}, []);

	// a request about a topic opens that topic's chat; others go to the open chat
	const sendToTutor = (changes: Omit<ComposerPreset, 'version'>) => {
		if (changes.topicId) setSelectedTopicId(changes.topicId);
		const scope = changes.topicId ?? scopeOf(selectedTopicId);
		setPreset((current) => ({
			version: (current?.version ?? 0) + 1,
			...changes,
			scope,
		}));
		setMobilePane('tutor');
	};

	const selectTopic = (topicId: string | null) => {
		setSelectedTopicId(topicId);
		setMobilePane('tutor');
	};

	const startTool = (action: TutorAction) => sendToTutor({ action });

	// picking a topic in the message box opens that topic's chat; what the student
	// typed goes with them
	const switchTopic = (topicId: string | null, draft: ComposerDraft) => {
		setSelectedTopicId(topicId);
		if (!draft.message.trim()) return;
		setPreset((current) => ({
			version: (current?.version ?? 0) + 1,
			scope: scopeOf(topicId),
			message: draft.message,
			action: draft.action,
			modelId: draft.modelId,
		}));
	};

	const openNotes = (topicId: string) => {
		setNotesTopicId(topicId);
		setNotesOpen(true);
	};

	const open =
		topicsOpen && studyOpen
			? 'both'
			: topicsOpen
				? 'left'
				: studyOpen
					? 'right'
					: 'none';

	const paneClass = (pane: WorkspacePane, openOnWide = true) =>
		cn(
			'min-h-0 flex-col',
			mobilePane === pane ? 'flex' : 'hidden',
			openOnWide ? 'lg:flex' : 'lg:hidden'
		);

	return (
		<div className="flex flex-1 flex-col">
			<MobilePaneTabs value={mobilePane} onChange={setMobilePane} />
			<div
				className={cn(
					// one row of fixed height, so each pane scrolls on its own;
					// 5rem is the app shell's top bar (3.5rem) and its margins (2 × 0.75rem)
					'flex flex-1 flex-col lg:grid lg:h-[calc(100svh-5rem)] lg:flex-none lg:grid-rows-1 lg:divide-x lg:divide-divider',
					columns[open]
				)}
			>
				<TopicsPane
					course={course}
					topics={topics.data}
					loadError={topics.isError ? apiErrorMessage(topics.error) : undefined}
					onRetry={() => topics.refetch()}
					selectedTopicId={selectedTopicId}
					onSelect={selectTopic}
					onOpenNotes={openNotes}
					busyScopes={busyScopes}
					className={paneClass('topics', topicsOpen)}
				/>
				<TutorPane
					course={course}
					topics={topics.data}
					selectedTopicId={selectedTopicId}
					onClearTopic={() => setSelectedTopicId(null)}
					onOpenNotes={openNotes}
					preset={preset}
					onStart={sendToTutor}
					busyScopes={busyScopes}
					onBusyChange={setScopeBusy}
					onSwitchTopic={switchTopic}
					topicsOpen={topicsOpen}
					onToggleTopics={() => setTopicsOpen((value) => !value)}
					studyOpen={studyOpen}
					onToggleStudy={() => setStudyOpen((value) => !value)}
					className={paneClass('tutor')}
				/>
				<StudyPane
					onStartTool={startTool}
					className={paneClass('study', studyOpen)}
				/>
			</div>
			<TopicNotesSheet
				courseId={course.id}
				topic={topics.data?.find((topic) => topic.id === notesTopicId)}
				open={notesOpen}
				onOpenChange={setNotesOpen}
			/>
		</div>
	);
}

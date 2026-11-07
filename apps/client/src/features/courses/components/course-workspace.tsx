'use client';

import type { Course, QuestionSet, TutorAction } from '@orbi/shared';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TopicNotesSheet } from '@/features/notes/components/topic-notes-sheet';
import { QuestionSetSheet } from '@/features/questions/components/question-set-sheet';
import { TopicQuestionsSheet } from '@/features/questions/components/topic-questions-sheet';
import { scopeOf } from '@/features/tutor/chat';
import type {
	ComposerDraft,
	ComposerPreset,
} from '@/features/tutor/components/note-composer';
import { apiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useTopics } from '../hooks';
import { useOpenTopic } from '../use-open-topic';
import { useTopicSheet } from '../use-topic-sheet';
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
	// what the tutor starts with: an action, a message, a topic's chat, a model
	start: Omit<ComposerPreset, 'version'>;
};

export function CourseWorkspace({ course, start }: CourseWorkspaceProps) {
	const topics = useTopics(course.id);
	const [topicsOpen, setTopicsOpen] = useState(true);
	const [studyOpen, setStudyOpen] = useState(true);
	const [mobilePane, setMobilePane] = useState<WorkspacePane>('tutor');
	// in the address, so a reload or Back opens the same chat
	const { topicId: selectedTopicId, openTopic } = useOpenTopic(course.id);
	const notesSheet = useTopicSheet();
	const questionsSheet = useTopicSheet();
	// kept while the sheet closes, like the topic sheets
	const [openedSet, setOpenedSet] = useState<QuestionSet>();
	const [setSheetOpen, setSetSheetOpen] = useState(false);
	// counts the requests to add a topic from outside the topics pane
	const [addTopicRequest, setAddTopicRequest] = useState(0);
	const [preset, setPreset] = useState<ScopedPreset | undefined>(() =>
		Object.values(start).some((value) => value !== undefined)
			? { version: 1, scope: scopeOf(start.topicId ?? null), ...start }
			: undefined
	);
	// a link can name a topic that was deleted since: the course chat opens instead
	useEffect(() => {
		if (!topics.data || !selectedTopicId) return;
		if (!topics.data.some((item) => item.id === selectedTopicId)) {
			openTopic(null, { replace: true });
		}
	}, [topics.data, selectedTopicId, openTopic]);
	// the chats with a reply running and the scope of each, for the limit on parallel
	// replies and the topic list
	const [busyChats, setBusyChats] = useState<ReadonlyMap<string, string>>(
		() => new Map()
	);
	const setChatBusy = useCallback(
		(chatId: string, scope: string, busy: boolean) => {
			setBusyChats((current) => {
				if (current.has(chatId) === busy) return current;
				const next = new Map(current);
				if (busy) next.set(chatId, scope);
				else next.delete(chatId);
				return next;
			});
		},
		[]
	);
	const busyScopes = useMemo(() => new Set(busyChats.values()), [busyChats]);

	// a request about a topic opens that topic's chat; others go to the open chat
	const sendToTutor = (changes: Omit<ComposerPreset, 'version'>) => {
		if (changes.topicId) openTopic(changes.topicId);
		const scope = changes.topicId ?? scopeOf(selectedTopicId);
		setPreset((current) => ({
			version: (current?.version ?? 0) + 1,
			...changes,
			scope,
		}));
		setMobilePane('tutor');
	};

	const selectTopic = (topicId: string | null) => {
		openTopic(topicId);
		setMobilePane('tutor');
	};

	const startTool = (action: TutorAction) => sendToTutor({ action });

	// picking a topic in the message box opens that topic's chat; what the student
	// typed goes with them
	const switchTopic = (topicId: string | null, draft: ComposerDraft) => {
		openTopic(topicId);
		if (!draft.message.trim()) return;
		setPreset((current) => ({
			version: (current?.version ?? 0) + 1,
			scope: scopeOf(topicId),
			message: draft.message,
			action: draft.action,
			modelId: draft.modelId,
			thinking: draft.thinking,
		}));
	};

	// the topics pane comes into view (on phones too) with its new topic field ready
	const addTopic = () => {
		setTopicsOpen(true);
		setMobilePane('topics');
		setAddTopicRequest((count) => count + 1);
	};

	const topicById = (topicId: string | null) =>
		topics.data?.find((topic) => topic.id === topicId);

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
					onOpenNotes={notesSheet.openFor}
					onOpenQuestions={questionsSheet.openFor}
					addTopicRequest={addTopicRequest}
					busyScopes={busyScopes}
					className={paneClass('topics', topicsOpen)}
				/>
				<TutorPane
					course={course}
					topics={topics.data}
					selectedTopicId={selectedTopicId}
					onClearTopic={() => openTopic(null)}
					onOpenNotes={notesSheet.openFor}
					preset={preset}
					onStart={sendToTutor}
					busyChats={busyChats}
					onBusyChange={setChatBusy}
					onSwitchTopic={switchTopic}
					onAddTopic={addTopic}
					topicsOpen={topicsOpen}
					onToggleTopics={() => setTopicsOpen((value) => !value)}
					studyOpen={studyOpen}
					onToggleStudy={() => setStudyOpen((value) => !value)}
					className={paneClass('tutor')}
				/>
				<StudyPane
					courseId={course.id}
					onStartTool={startTool}
					onOpenSet={(set) => {
						setOpenedSet(set);
						setSetSheetOpen(true);
					}}
					className={paneClass('study', studyOpen)}
				/>
			</div>
			<TopicNotesSheet
				courseId={course.id}
				topic={topicById(notesSheet.topicId)}
				open={notesSheet.open}
				onOpenChange={notesSheet.setOpen}
			/>
			<TopicQuestionsSheet
				courseId={course.id}
				topic={topicById(questionsSheet.topicId)}
				open={questionsSheet.open}
				onOpenChange={questionsSheet.setOpen}
			/>
			<QuestionSetSheet
				courseId={course.id}
				set={openedSet}
				open={setSheetOpen}
				onOpenChange={setSetSheetOpen}
			/>
		</div>
	);
}

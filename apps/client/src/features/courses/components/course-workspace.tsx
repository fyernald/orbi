'use client';

import type { Course, TutorAction } from '@orbi/shared';
import { useState } from 'react';
import { TopicNotesSheet } from '@/features/notes/components/topic-notes-sheet';
import type { ComposerPreset } from '@/features/tutor/components/note-composer';
import { apiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useTopics } from '../hooks';
import { MobilePaneTabs, type WorkspacePane } from './mobile-pane-tabs';
import { StudyPane } from './study-pane';
import { TopicsPane } from './topics-pane';
import { TutorPane } from './tutor-pane';

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
	const [preset, setPreset] = useState<ComposerPreset | undefined>(() =>
		start.action || start.message ? { version: 1, ...start } : undefined
	);

	const firstTopicId = topics.data?.[0]?.id;
	const sendToTutor = (changes: Omit<ComposerPreset, 'version'>) => {
		setPreset((current) => ({
			version: (current?.version ?? 0) + 1,
			...changes,
		}));
		setMobilePane('tutor');
	};

	const selectTopic = (topicId: string | null) => {
		setSelectedTopicId(topicId);
		if (topicId) sendToTutor({ topicId });
	};

	const startTool = (action: TutorAction) =>
		sendToTutor({ action, topicId: selectedTopicId ?? firstTopicId });

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

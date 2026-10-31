'use client';

import type { Course, Topic } from '@orbi/shared';
import { NotebookPen, PanelLeft, PanelRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddNotesPrompt } from '@/features/notes/components/add-notes-prompt';
import {
	NoteComposer,
	type ComposerPreset,
} from '@/features/tutor/components/note-composer';
import { defaultModelId, models } from '@/features/tutor/mock-data';
import { tutorStarters, type TutorStarter } from '../tutor-starters';
import { PaneHeader } from './pane-header';
import { PaneToggle } from './pane-toggle';
import { TutorStarterList } from './tutor-starter-list';

type TutorPaneProps = {
	course: Course;
	// undefined while loading; the composer waits for them to pick its first topic
	topics: Topic[] | undefined;
	selectedTopicId: string | null;
	onClearTopic: () => void;
	onOpenNotes: (topicId: string) => void;
	preset: ComposerPreset | undefined;
	onStart: (starter: Omit<TutorStarter, 'label'>) => void;
	topicsOpen: boolean;
	onToggleTopics: () => void;
	studyOpen: boolean;
	onToggleStudy: () => void;
	className?: string;
};

// the tutor answers once US-28 connects it; until then the composer works like on Home
export function TutorPane({
	course,
	topics,
	selectedTopicId,
	onClearTopic,
	onOpenNotes,
	preset,
	onStart,
	topicsOpen,
	onToggleTopics,
	studyOpen,
	onToggleStudy,
	className,
}: TutorPaneProps) {
	const selected = topics?.find((topic) => topic.id === selectedTopicId);
	const composerTopics = topics?.map((topic) => ({
		id: topic.id,
		course: course.name,
		name: topic.name,
	}));

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
								aria-label="Ask about the whole course"
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
						<PaneToggle
							label={studyOpen ? 'Hide study tools' : 'Show study tools'}
							pressed={studyOpen}
							onClick={onToggleStudy}
							icon={<PanelRight />}
						/>
					</>
				}
			/>
			<div className="flex-1 overflow-y-auto">
				<div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 py-10">
					{selected?.noteCount === 0 && (
						<AddNotesPrompt
							topicName={selected.name}
							onAddNotes={() => onOpenNotes(selected.id)}
						/>
					)}
					<TutorStarterList
						starters={tutorStarters(course, topics ?? [])}
						onStart={onStart}
					/>
				</div>
			</div>
			<div className="shrink-0 px-4 pb-4">
				<div className="mx-auto w-full max-w-2xl">
					{composerTopics && (
						<NoteComposer
							topics={composerTopics}
							models={models}
							defaultModelId={defaultModelId}
							preset={preset}
						/>
					)}
				</div>
			</div>
		</section>
	);
}

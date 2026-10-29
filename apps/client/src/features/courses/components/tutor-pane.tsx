'use client';

import type { Course, Topic } from '@orbi/shared';
import { PanelLeft, PanelRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
	NoteComposer,
	type ComposerPreset,
} from '@/features/home/components/note-composer';
import { defaultModelId, models } from '@/features/home/mock-data';
import { routes } from '@/lib/routes';
import { tutorStarters, type TutorStarter } from '../tutor-starters';
import { CourseActions } from './course-actions';
import { CourseIntro } from './course-intro';
import { PaneHeader } from './pane-header';
import { PaneToggle } from './pane-toggle';
import { TutorStarterList } from './tutor-starter-list';

type TutorPaneProps = {
	course: Course;
	// undefined while loading; the composer waits for them to pick its first topic
	topics: Topic[] | undefined;
	selectedTopicId: string | null;
	onClearTopic: () => void;
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
	preset,
	onStart,
	topicsOpen,
	onToggleTopics,
	studyOpen,
	onToggleStudy,
	className,
}: TutorPaneProps) {
	const router = useRouter();
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
						<h2 id="tutor-pane-title">Tutor</h2>
						{selected ? (
							<span className="flex min-w-0 items-center gap-1 rounded-md bg-muted py-0.5 pr-0.5 pl-2 text-xs font-normal">
								<span className="truncate">{selected.name}</span>
								<button
									type="button"
									onClick={onClearTopic}
									aria-label="Ask about the whole course"
									className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-background hover:text-foreground"
								>
									<X className="size-3" />
								</button>
							</span>
						) : (
							<span className="text-xs font-normal text-muted-foreground">
								Whole course
							</span>
						)}
					</>
				}
				actions={
					<>
						<CourseActions
							course={course}
							onDeleted={() => router.replace(routes.courses)}
						/>
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
					<CourseIntro course={course} />
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

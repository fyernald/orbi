'use client';

import type { Topic } from '@orbi/shared';
import { ArrowLeft, PanelLeft, PanelRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { NoteForm } from '@/features/notes/components/note-form';
import { NotesList } from '@/features/notes/components/notes-list';
import { PdfUpload } from '@/features/notes/components/pdf-upload';
import { VoiceNote } from '@/features/notes/voice/components/voice-note';
import { useReturnFocus } from '@/hooks/use-return-focus';
import { noteCountLabel } from '../note-count';
import { PaneHeader } from './pane-header';
import { PaneToggle } from './pane-toggle';

type NotesPaneProps = {
	courseId: string;
	// undefined while the topics load
	topic: Topic | undefined;
	onBack: () => void;
	topicsOpen: boolean;
	onToggleTopics: () => void;
	studyOpen: boolean;
	onToggleStudy: () => void;
	// the focus goes back here when the notes close
	returnFocusTo: string;
	className?: string;
};

// A topic's notes in the middle of the course page, in place of the chat (US-45).
// A narrow pane shows the new note above the saved ones; a wide one puts them
// side by side, so the student can write while reading what is saved.
export function NotesPane({
	courseId,
	topic,
	onBack,
	topicsOpen,
	onToggleTopics,
	studyOpen,
	onToggleStudy,
	returnFocusTo,
	className,
}: NotesPaneProps) {
	const title = useRef<HTMLHeadingElement>(null);
	useReturnFocus(returnFocusTo);
	// a screen reader hears where the student is now
	useEffect(() => title.current?.focus(), [topic?.id]);

	return (
		<section aria-labelledby="notes-pane-title" className={className}>
			<PaneHeader
				leading={
					<>
						<PaneToggle
							label={topicsOpen ? 'Hide topics' : 'Show topics'}
							pressed={topicsOpen}
							onClick={onToggleTopics}
							icon={<PanelLeft />}
						/>
						<Button
							variant="ghost"
							size="sm"
							onClick={onBack}
							aria-label="Back to the chat"
							className="-ml-1 rounded-md text-muted-foreground"
						>
							<ArrowLeft />
							Back
						</Button>
					</>
				}
				title={
					<>
						<h2
							id="notes-pane-title"
							ref={title}
							tabIndex={-1}
							className="truncate font-semibold outline-none"
						>
							{topic?.name ?? 'Notes'}
						</h2>
						<span className="text-xs font-normal text-muted-foreground">
							Notes
						</span>
					</>
				}
				actions={
					<PaneToggle
						label={studyOpen ? 'Hide study tools' : 'Show study tools'}
						pressed={studyOpen}
						onClick={onToggleStudy}
						icon={<PanelRight />}
					/>
				}
			/>
			{topic ? (
				<div className="@container min-h-0 flex-1 overflow-y-auto">
					{/* each topic starts with its own form and draft */}
					<div
						key={topic.id}
						className="mx-auto grid w-full max-w-chat gap-8 px-5 py-6 @4xl:max-w-6xl @4xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] @4xl:gap-10"
					>
						<section
							aria-labelledby="add-notes-title"
							className="flex flex-col gap-3 @4xl:sticky @4xl:top-6 @4xl:self-start"
						>
							<div className="flex flex-col gap-0.5">
								<h3 id="add-notes-title" className="text-sm font-semibold">
									Add notes
								</h3>
								<p className="text-sm text-muted-foreground">
									Orbi answers from your notes and makes questions from them.
								</p>
							</div>
							<NoteForm courseId={courseId} topicId={topic.id} />
							<PdfUpload courseId={courseId} topicId={topic.id} />
							<VoiceNote courseId={courseId} topicId={topic.id} />
						</section>
						<section
							aria-labelledby="saved-notes-title"
							className="flex flex-col gap-3"
						>
							<h3
								id="saved-notes-title"
								className="flex items-baseline gap-2 text-sm font-semibold"
							>
								Saved notes
								{topic.noteCount > 0 && (
									<span className="text-xs font-normal text-muted-foreground">
										{noteCountLabel(topic.noteCount)}
									</span>
								)}
							</h3>
							<NotesList courseId={courseId} topicId={topic.id} />
						</section>
					</div>
				</div>
			) : (
				<div
					role="status"
					aria-label="Loading the notes"
					className="mx-auto flex w-full max-w-chat flex-col gap-3 px-5 py-6"
				>
					{[0, 1, 2].map((row) => (
						<div
							key={row}
							className="h-24 animate-pulse rounded-xl bg-muted motion-reduce:animate-none"
						/>
					))}
				</div>
			)}
		</section>
	);
}

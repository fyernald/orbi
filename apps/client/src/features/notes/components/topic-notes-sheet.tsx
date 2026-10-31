'use client';

import type { Topic } from '@orbi/shared';
import { noteCountLabel } from '@/features/courses/note-count';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import { NoteForm } from './note-form';
import { NotesList } from './notes-list';

type TopicNotesSheetProps = {
	courseId: string;
	// kept while the sheet closes, so its content does not vanish mid-animation
	topic: Topic | undefined;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

// NotebookLM-style sources for one topic: add notes on top, the saved ones below
export function TopicNotesSheet({
	courseId,
	topic,
	open,
	onOpenChange,
}: TopicNotesSheetProps) {
	return (
		<Sheet open={open && topic !== undefined} onOpenChange={onOpenChange}>
			<SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
				{topic && (
					<>
						<SheetHeader className="border-b border-divider pr-12">
							<SheetTitle className="truncate">{topic.name}</SheetTitle>
							<SheetDescription>
								{noteCountLabel(topic.noteCount)} · Orbi makes questions from
								your notes.
							</SheetDescription>
						</SheetHeader>
						{/* a new topic starts with an empty form */}
						<div
							key={topic.id}
							className="flex flex-1 flex-col gap-6 overflow-y-auto p-4"
						>
							<NoteForm courseId={courseId} topicId={topic.id} />
							<section
								aria-labelledby="saved-notes-title"
								className="flex flex-col gap-3"
							>
								<h3
									id="saved-notes-title"
									className="text-[13px] font-medium text-muted-foreground"
								>
									Saved notes
								</h3>
								<NotesList courseId={courseId} topicId={topic.id} />
							</section>
						</div>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}

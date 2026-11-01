'use client';

import type { Note } from '@orbi/shared';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { isLongNote } from '../note-preview';
import { noteTime } from '../note-time';
import { EditNoteForm } from './edit-note-form';
import { NoteActions } from './note-actions';

type NoteCardProps = {
	courseId: string;
	note: Note;
};

// a saved note, shown as it was pasted; long ones open in place, and an edit
// happens in place too
export function NoteCard({ courseId, note }: NoteCardProps) {
	const [expanded, setExpanded] = useState(false);
	const [editing, setEditing] = useState(false);
	const actions = useRef<HTMLButtonElement>(null);
	const long = isLongNote(note.content);
	const time = noteTime(note, new Date());

	if (editing) {
		return (
			<EditNoteForm
				courseId={courseId}
				note={note}
				onDone={() => {
					setEditing(false);
					requestAnimationFrame(() => actions.current?.focus());
				}}
			/>
		);
	}

	return (
		<article className="flex flex-col gap-2 rounded-xl border border-border px-4 py-3">
			<header className="flex items-center justify-between gap-3">
				<h4 className="min-w-0 truncate text-sm font-medium">{note.title}</h4>
				<div className="flex shrink-0 items-center gap-1">
					<time
						dateTime={time.dateTime}
						className="text-xs text-muted-foreground"
					>
						{time.label}
					</time>
					<NoteActions
						courseId={courseId}
						note={note}
						onEdit={() => setEditing(true)}
						buttonRef={actions}
					/>
				</div>
			</header>
			<p
				className={cn(
					'text-sm leading-relaxed break-words whitespace-pre-wrap text-subtle-foreground',
					long && !expanded && 'line-clamp-5'
				)}
			>
				{note.content}
			</p>
			{long && (
				<button
					type="button"
					onClick={() => setExpanded((value) => !value)}
					aria-expanded={expanded}
					className="self-start rounded-sm text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
				>
					{expanded ? 'Show less' : 'Show all'}
				</button>
			)}
		</article>
	);
}

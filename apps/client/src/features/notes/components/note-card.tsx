'use client';

import type { Note } from '@orbi/shared';
import { useLayoutEffect, useRef, useState } from 'react';
import { isNotePreviewClipped } from '../note-preview';
import { noteTime } from '../note-time';
import { EditNoteForm } from './edit-note-form';
import { NoteActions } from './note-actions';
import { NoteContent } from './note-content';
import { NoteSource } from './note-source';

type NoteCardProps = {
	courseId: string;
	note: Note;
};

// a saved note; long ones open in place, and an edit happens in place too
export function NoteCard({ courseId, note }: NoteCardProps) {
	const [expanded, setExpanded] = useState(false);
	const [hasOverflow, setHasOverflow] = useState(false);
	const [editing, setEditing] = useState(false);
	const actions = useRef<HTMLButtonElement>(null);
	const preview = useRef<HTMLDivElement>(null);
	const time = noteTime(note, new Date());

	// measured only while the note is cut, before paint, so the button never pops in
	useLayoutEffect(() => {
		const element = preview.current;
		if (!element || expanded) return;

		const measure = () => setHasOverflow(isNotePreviewClipped(element));
		measure();

		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	}, [editing, expanded, note.content]);

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
			{note.sourceName && <NoteSource name={note.sourceName} />}
			<NoteContent ref={preview} note={note} expanded={expanded} />
			{(hasOverflow || expanded) && (
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

'use client';

import type { Note } from '@orbi/shared';
import { useState } from 'react';
import { formatTimeAgo } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { isLongNote } from '../note-preview';

// a saved note, shown as it was pasted; long ones open in place
export function NoteCard({ note }: { note: Note }) {
	const [expanded, setExpanded] = useState(false);
	const long = isLongNote(note.content);

	return (
		<article className="flex flex-col gap-2 rounded-xl border border-border px-4 py-3">
			<header className="flex items-baseline justify-between gap-3">
				<h4 className="min-w-0 truncate text-sm font-medium">{note.title}</h4>
				<time
					dateTime={note.createdAt}
					className="shrink-0 text-xs text-muted-foreground"
				>
					{formatTimeAgo(note.createdAt, new Date())}
				</time>
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

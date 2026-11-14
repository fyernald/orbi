import type { Note } from '@orbi/shared';
import type { Ref } from 'react';
import { Markdown } from '@/features/tutor/components/chat/markdown';
import { cn } from '@/lib/utils';

type NoteContentProps = {
	note: Note;
	expanded: boolean;
	ref: Ref<HTMLDivElement>;
};

// A note the student wrote is shown as it was pasted. The key points Orbi wrote
// from a PDF are Markdown, with headings, lists and formulas. A long note is cut
// until it is opened.
export function NoteContent({ note, expanded, ref }: NoteContentProps) {
	if (note.sourceName) {
		return (
			<div
				ref={ref}
				className={cn('min-w-0', !expanded && 'max-h-32 overflow-hidden')}
			>
				<Markdown
					text={note.content}
					streaming={false}
					className="text-sm text-subtle-foreground [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-foreground"
				/>
			</div>
		);
	}
	return (
		<div
			ref={ref}
			className={cn(
				'text-sm leading-relaxed break-words whitespace-pre-wrap text-subtle-foreground',
				!expanded && 'line-clamp-5'
			)}
		>
			{note.content}
		</div>
	);
}

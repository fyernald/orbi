'use client';

import type { TutorMessageMetadata } from '@orbi/shared';
import { BookOpen, Info } from 'lucide-react';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { notesReadLabel } from '../../notes-read';

const LIMIT_HINT =
	'Orbi reads about 25,000 words of notes per reply, the newest first. PDFs you attach in the chat are read before the rest.';

type NotesReadLineProps = {
	metadata: TutorMessageMetadata | undefined;
	topic: string;
};

// which notes the tutor read for a reply; when some did not fit, a hint says why
export function NotesReadLine({ metadata, topic }: NotesReadLineProps) {
	const label = metadata && notesReadLabel(metadata, topic);
	if (!label) return null;

	return (
		<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
			<BookOpen className="size-3.5" />
			{label.text}
			{label.partial && (
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							aria-label={LIMIT_HINT}
							className="rounded-full outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
						>
							<Info className="size-3.5" />
						</button>
					</TooltipTrigger>
					<TooltipContent className="max-w-64">{LIMIT_HINT}</TooltipContent>
				</Tooltip>
			)}
		</p>
	);
}

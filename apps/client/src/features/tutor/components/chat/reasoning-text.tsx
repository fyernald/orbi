'use client';

import { useStickToBottom } from 'use-stick-to-bottom';
import { Markdown } from './markdown';

// The thinking itself. Long thinking scrolls inside its own box, and the box
// follows new words unless the student scrolls up to read.
export function ReasoningText({
	text,
	streaming,
}: {
	text: string;
	streaming: boolean;
}) {
	const { scrollRef, contentRef } = useStickToBottom({
		resize: 'smooth',
		initial: 'instant',
	});

	return (
		<div
			ref={scrollRef}
			// focusable, so the arrow keys scroll long thinking
			tabIndex={0}
			className="mt-2 max-h-72 overflow-y-auto rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
		>
			<div ref={contentRef} className="border-l-2 border-border pl-3">
				<Markdown
					text={text}
					streaming={streaming}
					className="text-sm text-muted-foreground"
				/>
			</div>
		</div>
	);
}

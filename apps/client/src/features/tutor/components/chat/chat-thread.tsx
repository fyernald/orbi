'use client';

import { ArrowDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';

// Follows a reply while the student is at the end of the chat. Scrolling up stops
// that, and a button brings them back to the newest message.
export function ChatThread({ children }: { children: ReactNode }) {
	return (
		<StickToBottom
			role="region"
			aria-label="Chat with Orbi"
			className="relative min-h-0 flex-1"
			resize="smooth"
			initial="instant"
		>
			{/* focusable, so the arrow keys scroll the chat */}
			<StickToBottom.Content
				tabIndex={0}
				className="mx-auto flex w-full max-w-chat flex-col gap-7 px-5 py-8 focus-visible:outline-none"
				// relative: the sr-only headings are absolute, and would otherwise stretch
				// the page and scroll it along with the chat
				scrollClassName="relative overflow-y-auto"
			>
				{children}
			</StickToBottom.Content>
			<JumpToLatest />
		</StickToBottom>
	);
}

function JumpToLatest() {
	const { isAtBottom, scrollToBottom } = useStickToBottomContext();
	if (isAtBottom) return null;
	return (
		<button
			type="button"
			onClick={() => void scrollToBottom()}
			className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
		>
			<ArrowDown className="size-3.5" />
			Jump to latest
		</button>
	);
}

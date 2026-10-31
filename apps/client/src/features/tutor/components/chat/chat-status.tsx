'use client';

import type { ChatStatus } from 'ai';
import { useEffect, useRef, useState } from 'react';

// Tells screen readers what the chat is doing. The reply itself is not in a live
// region: read token by token, it would come out in broken pieces.
export function ChatStatusAnnouncer({
	status,
	stopped,
}: {
	status: ChatStatus;
	stopped: boolean;
}) {
	const [text, setText] = useState('');
	const previous = useRef(status);

	useEffect(() => {
		const before = previous.current;
		previous.current = status;
		if (before === status) return;

		let next = '';
		if (status === 'submitted') next = 'Orbi is thinking.';
		else if (status === 'error') next = 'The reply failed. You can try again.';
		else if (status === 'ready' && before === 'streaming') {
			next = stopped ? 'Reply stopped.' : 'Orbi replied.';
		}
		if (!next) return;

		// cleared first, so the same words are announced again
		setText('');
		const timer = setTimeout(() => setText(next), 100);
		return () => clearTimeout(timer);
	}, [status, stopped]);

	return (
		<p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
			{text}
		</p>
	);
}

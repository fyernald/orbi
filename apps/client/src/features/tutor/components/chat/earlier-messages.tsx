'use client';

import { RotateCcw } from 'lucide-react';
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import { useStickToBottomContext } from 'use-stick-to-bottom';
import { Button } from '@/components/ui/button';
import { ChatSkeleton } from './chat-skeleton';

// the chat first scrolls to its newest message; watching the top before that would
// load older messages nobody asked for
const SETTLE_MS = 400;

type EarlierMessagesProps = {
	hasEarlier: boolean;
	// how many messages the chat shows; it changes when older ones are added
	messageCount: number;
	onLoad: () => Promise<void>;
};

// The top of a long chat. Older messages load when the student scrolls near it, so a
// big chat opens fast; a skeleton holds their place while they come. It stays mounted
// after the last page, to keep the student's place when that page is added.
export function EarlierMessages({
	hasEarlier,
	messageCount,
	onLoad,
}: EarlierMessagesProps) {
	const { scrollRef } = useStickToBottomContext();
	const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
	const [settled, setSettled] = useState(false);
	const marker = useRef<HTMLDivElement>(null);
	// the distance from the bottom before older messages were added
	const keepFromBottom = useRef<number | null>(null);

	useEffect(() => {
		const timer = setTimeout(() => setSettled(true), SETTLE_MS);
		return () => clearTimeout(timer);
	}, []);

	// added messages go above, so the student keeps looking at the same message
	useLayoutEffect(() => {
		const scroller = scrollRef.current;
		if (keepFromBottom.current === null || !scroller) return;
		scroller.scrollTop = scroller.scrollHeight - keepFromBottom.current;
		keepFromBottom.current = null;
	}, [messageCount, scrollRef]);

	const load = useCallback(async () => {
		const scroller = scrollRef.current;
		keepFromBottom.current = scroller
			? scroller.scrollHeight - scroller.scrollTop
			: null;
		setState('loading');
		try {
			await onLoad();
			setState('idle');
		} catch {
			keepFromBottom.current = null;
			setState('error');
		}
	}, [onLoad, scrollRef]);

	useEffect(() => {
		const element = marker.current;
		if (!element || !settled || !hasEarlier || state !== 'idle') return;
		// starts a little before the top is reached, so the wait is shorter
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) void load();
			},
			{ rootMargin: '300px 0px 0px 0px' }
		);
		observer.observe(element);
		return () => observer.disconnect();
	}, [settled, hasEarlier, state, load]);

	if (!hasEarlier) return null;

	if (state === 'error') {
		return (
			<p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
				Earlier messages could not load.
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => void load()}
					className="h-7 rounded-md px-2"
				>
					<RotateCcw />
					Try again
				</Button>
			</p>
		);
	}

	return (
		<div ref={marker} aria-busy={state === 'loading'}>
			<span className="sr-only">Scroll up to load earlier messages</span>
			<ChatSkeleton count={2} />
		</div>
	);
}

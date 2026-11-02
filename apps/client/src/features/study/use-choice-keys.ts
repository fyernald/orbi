'use client';

import { useEffect, useRef } from 'react';
import { choiceForKey } from './session';

const isTyping = (target: EventTarget | null) =>
	target instanceof HTMLElement &&
	(target.isContentEditable ||
		['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

// 1 to 4 or A to D answers the shown question; Enter is left to the focused button
export function useChoiceKeys({
	enabled,
	choiceCount,
	onPick,
}: {
	enabled: boolean;
	choiceCount: number;
	onPick: (choice: number) => void;
}) {
	// the newest handler, without adding the listener again on every render
	const pick = useRef(onPick);
	useEffect(() => {
		pick.current = onPick;
	});

	useEffect(() => {
		if (!enabled) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.repeat || event.ctrlKey || event.metaKey || event.altKey)
				return;
			if (isTyping(event.target)) return;
			const choice = choiceForKey(event.key, choiceCount);
			if (choice === null) return;
			event.preventDefault();
			pick.current(choice);
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [enabled, choiceCount]);
}

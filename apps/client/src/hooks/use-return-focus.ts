'use client';

import { useEffect } from 'react';

// When a view that had the focus goes away, the focus would fall back to the top
// of the page; it goes to the element with this id instead, a frame later, once
// that element shows again
export function useReturnFocus(targetId: string) {
	useEffect(
		() => () => {
			requestAnimationFrame(() => {
				if (
					document.activeElement &&
					document.activeElement !== document.body
				) {
					return;
				}
				document.getElementById(targetId)?.focus();
			});
		},
		[targetId]
	);
}

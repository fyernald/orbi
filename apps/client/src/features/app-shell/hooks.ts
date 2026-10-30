'use client';

import { useCallback, useState } from 'react';
import { scrollEdges, type ScrollEdges } from './scroll-edges';

const noEdges: ScrollEdges = { above: false, below: false };

// whether a scroll area has more above or below, kept up to date while it scrolls,
// changes size, or gets new items; give `ref` to the scrolling element
export function useScrollEdges() {
	const [edges, setEdges] = useState(noEdges);

	const ref = useCallback((element: HTMLElement | null) => {
		if (!element) return;

		const update = () => {
			const next = scrollEdges(element);
			setEdges((current) =>
				current.above === next.above && current.below === next.below
					? current
					: next
			);
		};
		update();

		const resizes = new ResizeObserver(update);
		resizes.observe(element);
		const newItems = new MutationObserver(update);
		newItems.observe(element, { childList: true });
		element.addEventListener('scroll', update, { passive: true });

		return () => {
			resizes.disconnect();
			newItems.disconnect();
			element.removeEventListener('scroll', update);
		};
	}, []);

	return { ref, ...edges };
}

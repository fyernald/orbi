'use client';

import { useCallback, useState } from 'react';

// The width of an element, kept up to date as it changes size; give `ref` to the
// element. It is 0 until the element is on the page.
export function useElementWidth() {
	const [width, setWidth] = useState(0);

	const ref = useCallback((element: HTMLElement | null) => {
		if (!element) return;
		const update = () =>
			setWidth(Math.round(element.getBoundingClientRect().width));
		update();
		const resizes = new ResizeObserver(update);
		resizes.observe(element);
		return () => resizes.disconnect();
	}, []);

	return { ref, width };
}

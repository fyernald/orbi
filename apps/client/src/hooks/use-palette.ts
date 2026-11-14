'use client';

import { useSyncExternalStore } from 'react';
import { readPalette, savePalette, type Palette } from '@/lib/palette';

// the colour theme lives on <html> (data-palette), where the server put it from the
// cookie; this follows it, so anything drawn from the tokens can draw again
function subscribe(onChange: () => void) {
	const observer = new MutationObserver(onChange);
	observer.observe(document.documentElement, {
		attributeFilter: ['data-palette'],
	});
	return () => observer.disconnect();
}

const read = () => readPalette(document.documentElement.dataset.palette);

// null on the server and while hydrating
export function usePalette(): Palette | null {
	return useSyncExternalStore(subscribe, read, () => null);
}

// the page fades into the new colours where the browser can, else changes at once
export function pickPalette(palette: Palette): void {
	savePalette(palette);
	const apply = () => {
		document.documentElement.dataset.palette = palette;
	};
	if (document.startViewTransition) document.startViewTransition(apply);
	else apply();
}

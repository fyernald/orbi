'use client';

import { useTheme } from 'next-themes';
import { useCallback, useEffect, useId, useState } from 'react';
import { usePalette } from '@/hooks/use-palette';
import { renderMermaid } from './render-mermaid';

export type DiagramDrawing =
	| { status: 'drawing' }
	| { status: 'drawn'; svg: string }
	| { status: 'failed' };

type Drawn = { key: string; drawing: DiagramDrawing };

// The diagram as SVG, drawn again when the theme or colour theme changes, so its
// colours follow them. redraw tries once more after a failure.
export function useMermaidSvg(source: string) {
	const { resolvedTheme } = useTheme();
	const palette = usePalette();
	const baseId = `diagram-${useId().replace(/[^\w-]/g, '')}`;
	const [attempt, setAttempt] = useState(0);
	const key = `${resolvedTheme}:${palette}:${attempt}:${source}`;
	const [drawn, setDrawn] = useState<Drawn>();

	useEffect(() => {
		// next-themes knows the theme only once mounted
		if (!resolvedTheme) return;
		let current = true;
		renderMermaid(source, `${baseId}-${attempt}`, resolvedTheme === 'dark')
			.then((svg) => {
				if (current) setDrawn({ key, drawing: { status: 'drawn', svg } });
			})
			.catch((error: unknown) => {
				console.warn('The diagram could not be drawn.', error);
				if (current) setDrawn({ key, drawing: { status: 'failed' } });
			});
		return () => {
			current = false;
		};
	}, [source, resolvedTheme, attempt, baseId, key]);

	const redraw = useCallback(() => setAttempt((count) => count + 1), []);
	// a drawing stays on screen while the other theme's one is made, instead of a flash
	const drawing: DiagramDrawing =
		drawn && (drawn.key === key || drawn.drawing.status === 'drawn')
			? drawn.drawing
			: { status: 'drawing' };
	return { drawing, redraw };
}

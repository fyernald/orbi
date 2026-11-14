'use client';

import { useLayoutEffect, useState } from 'react';
import type { Box, Size } from './placement';
import { tourTargetSelector, type TourTarget } from './steps';

const isShown = (element: Element) => {
	const box = element.getBoundingClientRect();
	return box.width > 0 && box.height > 0;
};

// the first of the targets that shows on the page: the sidebar is folded away
// on phones, and Home has no Today panel before there are questions
function findTarget(targets: TourTarget[]): Element | null {
	for (const target of targets) {
		const found = [
			...document.querySelectorAll(tourTargetSelector(target)),
		].find(isShown);
		if (found) return found;
	}
	return null;
}

const toBox = (element: Element): Box => {
	const { top, left, width, height } = element.getBoundingClientRect();
	return { top, left, width, height };
};

const viewportSize = (): Size => ({
	width: window.innerWidth,
	height: window.innerHeight,
});

const reducedMotion = () =>
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Where the part a tour step points at is on screen, and the screen's size. It
// follows the page when it scrolls or resizes, and brings the part into view.
export function useTourLayout(targets: TourTarget[]) {
	const [layout, setLayout] = useState<{ target: Box | null; viewport: Size }>(
		() => ({ target: null, viewport: { width: 0, height: 0 } })
	);
	const key = targets.join(' ');

	useLayoutEffect(() => {
		const element = findTarget(key.split(' ') as TourTarget[]);
		const measure = () =>
			setLayout({
				target: element && isShown(element) ? toBox(element) : null,
				viewport: viewportSize(),
			});

		element?.scrollIntoView({
			block: 'nearest',
			inline: 'nearest',
			behavior: reducedMotion() ? 'auto' : 'smooth',
		});
		measure();

		const observer = new ResizeObserver(measure);
		if (element) observer.observe(element);
		window.addEventListener('resize', measure);
		// any scrolling box can move the part, so scrolls are caught on the way down
		window.addEventListener('scroll', measure, true);
		return () => {
			observer.disconnect();
			window.removeEventListener('resize', measure);
			window.removeEventListener('scroll', measure, true);
		};
	}, [key]);

	return layout;
}

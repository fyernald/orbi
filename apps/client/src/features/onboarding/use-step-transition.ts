'use client';

import { useEffect, useRef, useState } from 'react';

export type StepDirection = 'forward' | 'back';

// matches the step-leave animation in globals.css
const LEAVE_MS = 200;

const prefersReducedMotion = () =>
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Moves between steps in two beats: the current step plays its leave animation,
// then the next one mounts and plays its enter animation. With reduced motion it just swaps.
export function useStepTransition(start: number) {
	const [state, setState] = useState({
		index: start,
		direction: 'forward' as StepDirection,
		leaving: false,
	});
	const timer = useRef<number | undefined>(undefined);

	useEffect(() => () => window.clearTimeout(timer.current), []);

	const go = (to: number) => {
		const direction: StepDirection = to > state.index ? 'forward' : 'back';
		window.clearTimeout(timer.current);
		if (prefersReducedMotion()) {
			setState({ index: to, direction, leaving: false });
			return;
		}
		setState({ ...state, direction, leaving: true });
		timer.current = window.setTimeout(
			() => setState({ index: to, direction, leaving: false }),
			LEAVE_MS
		);
	};

	return { ...state, go };
}

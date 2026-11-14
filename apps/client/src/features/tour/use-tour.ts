'use client';

import { useCallback, useState } from 'react';
import { useFinishTour } from './hooks';
import { tourSteps } from './steps';

// The step that shows, or null when the tour is closed. Done on the last step,
// Skip and the close button all end it, and the account remembers that.
export function useTour() {
	const [index, setIndex] = useState<number | null>(null);
	const { mutate: saveSeen } = useFinishTour();

	const start = useCallback(() => setIndex(0), []);

	const end = () => {
		setIndex(null);
		saveSeen();
	};

	const next = () => {
		if (index === null) return;
		if (index + 1 < tourSteps.length) setIndex(index + 1);
		else end();
	};

	const back = () => {
		if (index !== null && index > 0) setIndex(index - 1);
	};

	return {
		step: index === null ? null : tourSteps[index]!,
		index: index ?? 0,
		total: tourSteps.length,
		start,
		next,
		back,
		end,
	};
}

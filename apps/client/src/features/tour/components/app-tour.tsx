'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useEffectEvent } from 'react';
import { TOUR_PARAM } from '@/lib/routes';
import { useTour } from '../use-tour';
import { TourDialog } from './tour-dialog';

// the app grows into place when a new student arrives from the welcome
// questions; the tour waits for it
const AUTO_START_DELAY_MS = 700;

type AppTourProps = {
	// the account has not finished or skipped the tour yet
	autoStart: boolean;
};

// The tour of the app on Home (US-46): it starts by itself the first time, and
// again whenever the student asks for it from Settings or the account menu
// (?tour=1, which leaves the address at once, so a reload does not repeat it)
export function AppTour({ autoStart }: AppTourProps) {
	const tour = useTour();
	const asked = useSearchParams().get(TOUR_PARAM) === '1';

	const startAsked = useEffectEvent(() => {
		const { pathname, hash } = window.location;
		window.history.replaceState(null, '', `${pathname}${hash}`);
		tour.start();
	});
	useEffect(() => {
		if (asked) startAsked();
	}, [asked]);

	const startFirstTime = useEffectEvent(() => tour.start());
	useEffect(() => {
		if (!autoStart) return;
		const timer = window.setTimeout(startFirstTime, AUTO_START_DELAY_MS);
		return () => window.clearTimeout(timer);
	}, [autoStart]);

	if (!tour.step) return null;
	return (
		<TourDialog
			step={tour.step}
			index={tour.index}
			total={tour.total}
			onNext={tour.next}
			onBack={tour.back}
			onEnd={tour.end}
		/>
	);
}

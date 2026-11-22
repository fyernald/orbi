'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { pickTip, type Tip } from './tips';
import { useTipContext } from './use-tip-context';

// a tip waits until the student has been on the page a moment
export const TIP_DELAY_MS = 1500;

type CurrentTip = {
	tip: Tip | null;
	// after a close, the next tip waits for another page
	quiet: () => void;
};

// the tip the cat gives now, if any; none while `paused` (its menu is open)
export function useCurrentTip(
	dismissed: readonly string[],
	paused: boolean
): CurrentTip {
	const pathname = usePathname();
	const tip = pickTip(useTipContext(), dismissed);
	const [readyOn, setReadyOn] = useState<string | null>(null);
	const [quietOn, setQuietOn] = useState<string | null>(null);

	useEffect(() => {
		const timer = window.setTimeout(() => setReadyOn(pathname), TIP_DELAY_MS);
		return () => window.clearTimeout(timer);
	}, [pathname]);

	const shows = !paused && readyOn === pathname && quietOn !== pathname;
	return {
		tip: shows ? tip : null,
		quiet: () => setQuietOn(pathname),
	};
}

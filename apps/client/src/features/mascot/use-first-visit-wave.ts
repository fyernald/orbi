'use client';

import { useEffect } from 'react';
import { mascotReactions } from './reaction-store';
import { MOMENT_MS } from './reactions';

const WAVED_KEY = 'orbi.mascotWaved';

// storage can be off (a private window, blocked site data); then the cat waves
// on every load, which is fine
function wavedThisVisit(): boolean {
	try {
		return window.sessionStorage.getItem(WAVED_KEY) === '1';
	} catch {
		return false;
	}
}

function rememberWave() {
	try {
		window.sessionStorage.setItem(WAVED_KEY, '1');
	} catch {
		// nothing to remember it in
	}
}

// the cat waves hello once when the student opens the app, not on every page
export function useFirstVisitWave(enabled: boolean) {
	useEffect(() => {
		if (!enabled || wavedThisVisit()) return;
		rememberWave();
		mascotReactions.flash('wave', MOMENT_MS);
	}, [enabled]);
}

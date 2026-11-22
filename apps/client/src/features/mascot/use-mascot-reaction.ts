'use client';

import { useEffect, useSyncExternalStore } from 'react';
import type { MascotPose, MascotReaction } from './poses';
import { mascotReactions } from './reaction-store';
import { MOMENT_MS } from './reactions';

// the cat does `reaction` while `active` is true, like thinking while a reply
// is written
export function useMascotReaction(reaction: MascotReaction, active: boolean) {
	useEffect(() => {
		if (!active) return;
		return mascotReactions.hold(reaction);
	}, [reaction, active]);
}

// the cat does `reaction` for a moment, once, when the caller shows up
export function useMascotMoment(reaction: MascotReaction) {
	useEffect(() => {
		mascotReactions.flash(reaction, MOMENT_MS);
	}, [reaction]);
}

// the pose the cat is in now; it rests on the server
export function useMascotPose(): MascotPose {
	return useSyncExternalStore(
		mascotReactions.subscribe,
		mascotReactions.getPose,
		() => 'idle'
	);
}

'use client';

import type { MascotReaction } from '../poses';
import { useMascotMoment, useMascotReaction } from '../use-mascot-reaction';

type MoodProps = { reaction: MascotReaction };

// Put on a page or a part of one, even a server component: the cat does
// `reaction` while it shows (a sleepy cat on an empty page). Renders nothing.
export function MascotMood({ reaction }: MoodProps) {
	useMascotReaction(reaction, true);
	return null;
}

// the cat does `reaction` for a moment when this shows (a cheer for a right
// answer). Renders nothing.
export function MascotMoment({ reaction }: MoodProps) {
	useMascotMoment(reaction);
	return null;
}

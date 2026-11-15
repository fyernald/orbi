import type { MascotPose, MascotReaction } from './poses';

// When several things happen at once, the one that matters most to the student
// wins: a right answer beats a reply being written, and anything beats an
// empty page
export const REACTION_PRIORITY: Record<MascotReaction, number> = {
	cheer: 4,
	think: 3,
	wave: 2,
	sleepy: 1,
};

// a cheer or a wave lasts this long
export const MOMENT_MS = 2400;

export function poseFor(active: Iterable<MascotReaction>): MascotPose {
	let pose: MascotPose = 'idle';
	let best = 0;
	for (const reaction of active) {
		if (REACTION_PRIORITY[reaction] > best) {
			pose = reaction;
			best = REACTION_PRIORITY[reaction];
		}
	}
	return pose;
}

import type { MascotPose, MascotReaction } from './poses';
import { poseFor } from './reactions';

export type ReactionStore = {
	// on until the returned function is called; two places may hold the same one
	hold: (reaction: MascotReaction) => () => void;
	// on for `ms`, like a cheer after a right answer
	flash: (reaction: MascotReaction, ms: number) => void;
	subscribe: (listener: () => void) => () => void;
	getPose: () => MascotPose;
};

// The reactions asked for anywhere in the app, outside React, so a reaction
// re-renders only the cat and not the page that asked for it
export function createReactionStore(): ReactionStore {
	const counts = new Map<MascotReaction, number>();
	const listeners = new Set<() => void>();
	let pose: MascotPose = 'idle';

	const update = () => {
		const next = poseFor(counts.keys());
		if (next === pose) return;
		pose = next;
		listeners.forEach((listener) => listener());
	};

	const add = (reaction: MascotReaction) => {
		counts.set(reaction, (counts.get(reaction) ?? 0) + 1);
		update();
	};
	const remove = (reaction: MascotReaction) => {
		const left = (counts.get(reaction) ?? 1) - 1;
		if (left > 0) counts.set(reaction, left);
		else counts.delete(reaction);
		update();
	};

	return {
		hold(reaction) {
			add(reaction);
			let released = false;
			return () => {
				if (released) return;
				released = true;
				remove(reaction);
			};
		},
		flash(reaction, ms) {
			add(reaction);
			setTimeout(() => remove(reaction), ms);
		},
		subscribe(listener) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		getPose: () => pose,
	};
}

export const mascotReactions = createReactionStore();

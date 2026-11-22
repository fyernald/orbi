// The cat's poses (US-48): resting, and one for each thing it reacts to
export const MASCOT_POSES = [
	'idle',
	'wave',
	'think',
	'cheer',
	'sleepy',
] as const;

export type MascotPose = (typeof MASCOT_POSES)[number];

// what other parts of the app can ask the cat to do
export type MascotReaction = Exclude<MascotPose, 'idle'>;

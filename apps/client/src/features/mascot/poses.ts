// The cat's poses (US-48). Only the resting pose for now; waving, thinking,
// cheering and sleepy come with the reactions.
export const MASCOT_POSES = ['idle'] as const;

export type MascotPose = (typeof MASCOT_POSES)[number];

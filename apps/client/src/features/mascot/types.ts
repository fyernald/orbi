import type { Profile } from '@orbi/shared';

// what the server sent with the page about the cat
export type MascotSaved = Pick<Profile, 'mascotEnabled' | 'dismissedTips'>;

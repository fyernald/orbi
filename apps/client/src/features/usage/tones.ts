import type { UsageState } from '@orbi/shared';

// colour only where it means something: calm with room, amber near a limit, red over it
export const usageTextTone: Record<UsageState, string> = {
	ok: 'text-primary',
	warning: 'text-tone-amber-foreground',
	almost: 'text-tone-amber-foreground',
	grace: 'text-tone-red-foreground',
	blocked: 'text-tone-red-foreground',
};

export const usageBarTone: Record<UsageState, string> = {
	ok: 'bg-primary',
	warning: 'bg-tone-amber-foreground',
	almost: 'bg-tone-amber-foreground',
	grace: 'bg-tone-red-foreground',
	blocked: 'bg-tone-red-foreground',
};

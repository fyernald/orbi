import type { CourseColor } from '@orbi/shared';

// full class names, so Tailwind finds them
export const courseTints: Record<CourseColor, { hero: string; ring: string }> =
	{
		blue: { hero: 'from-tone-blue', ring: 'border-tone-blue-foreground/10' },
		teal: { hero: 'from-tone-teal', ring: 'border-tone-teal-foreground/10' },
		green: {
			hero: 'from-tone-green',
			ring: 'border-tone-green-foreground/10',
		},
		amber: {
			hero: 'from-tone-amber',
			ring: 'border-tone-amber-foreground/10',
		},
		red: { hero: 'from-tone-red', ring: 'border-tone-red-foreground/10' },
	};

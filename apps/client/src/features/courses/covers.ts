import type { CourseColor } from '@orbi/shared';

// full class names, so Tailwind finds them: the cover fill, its large initials,
// and the soft panel behind the up-next card
export const covers: Record<
	CourseColor,
	{ cover: string; initials: string; panel: string }
> = {
	blue: {
		cover: 'bg-tone-blue text-tone-blue-foreground',
		initials: 'text-tone-blue-foreground/15',
		panel: 'from-tone-blue/70',
	},
	teal: {
		cover: 'bg-tone-teal text-tone-teal-foreground',
		initials: 'text-tone-teal-foreground/15',
		panel: 'from-tone-teal/70',
	},
	green: {
		cover: 'bg-tone-green text-tone-green-foreground',
		initials: 'text-tone-green-foreground/15',
		panel: 'from-tone-green/70',
	},
	amber: {
		cover: 'bg-tone-amber text-tone-amber-foreground',
		initials: 'text-tone-amber-foreground/15',
		panel: 'from-tone-amber/70',
	},
	red: {
		cover: 'bg-tone-red text-tone-red-foreground',
		initials: 'text-tone-red-foreground/15',
		panel: 'from-tone-red/70',
	},
};

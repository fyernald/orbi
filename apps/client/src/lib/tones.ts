export type Tone = 'blue' | 'teal' | 'green' | 'amber' | 'red';

export const toneClasses: Record<Tone, string> = {
	blue: 'bg-tone-blue text-tone-blue-foreground',
	teal: 'bg-tone-teal text-tone-teal-foreground',
	green: 'bg-tone-green text-tone-green-foreground',
	amber: 'bg-tone-amber text-tone-amber-foreground',
	red: 'bg-tone-red text-tone-red-foreground',
};

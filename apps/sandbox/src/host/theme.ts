import type {
	SandboxColorName,
	SandboxTheme,
} from '@orbi/shared/mini-app-protocol';

// the CSS variable each colour becomes inside the frame, named as in the prompt
const COLOR_VARIABLES: Record<SandboxColorName, string> = {
	background: '--orbi-background',
	foreground: '--orbi-foreground',
	muted: '--orbi-muted',
	mutedForeground: '--orbi-muted-foreground',
	border: '--orbi-border',
	primary: '--orbi-primary',
};

// what the mini-app's CSS can read: --orbi-foreground, --orbi-chart-1 and so on
export function themeVariables(theme: SandboxTheme): Record<string, string> {
	const variables: Record<string, string> = { '--orbi-font': theme.fontFamily };
	for (const [name, variable] of Object.entries(COLOR_VARIABLES)) {
		variables[variable] = theme.colors[name as SandboxColorName];
	}
	theme.charts.forEach((color, index) => {
		variables[`--orbi-chart-${index + 1}`] = color;
	});
	return variables;
}

// what the mini-app's JavaScript can read, as orbi.colors and orbi.charts
export type OrbiGlobal = Pick<SandboxTheme, 'dark' | 'colors' | 'charts'> & {
	font: string;
};

export const orbiGlobal = (theme: SandboxTheme): OrbiGlobal => ({
	dark: theme.dark,
	colors: { ...theme.colors },
	charts: [...theme.charts],
	font: theme.fontFamily,
});

// the event a mini-app can listen to, to redraw when the student switches theme
export const THEME_EVENT = 'orbi-theme';

import type { SandboxTheme } from '@orbi/shared';
import { cssColorToHex } from './colors';
import { readThemeTokens, type ThemeTokens } from './theme-tokens';

// The app's web font is not loaded inside the frame, so the system's sans-serif
// font stands in for it there.
const FONT_FALLBACK = 'ui-sans-serif, system-ui, sans-serif';

// Orbi's theme as a mini-app gets it. The frame sits on the card, so the card's
// colour is the mini-app's background.
export function toSandboxTheme(
	tokens: ThemeTokens,
	primary: string,
	dark: boolean
): SandboxTheme {
	return {
		dark,
		colors: {
			background: tokens.card,
			foreground: tokens.foreground,
			muted: tokens.muted,
			mutedForeground: tokens.mutedForeground,
			border: tokens.border,
			primary,
		},
		charts: [...tokens.charts],
		fontFamily: `${tokens.fontFamily}, ${FONT_FALLBACK}`,
	};
}

// the theme on screen now (light or dark, and the colour theme)
export function readSandboxTheme(dark: boolean): SandboxTheme {
	const primary = getComputedStyle(document.documentElement)
		.getPropertyValue('--primary')
		.trim();
	return toSandboxTheme(readThemeTokens(), cssColorToHex(primary), dark);
}

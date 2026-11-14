import { describe, expect, it } from 'vitest';
import { toSandboxTheme } from './sandbox-theme';
import type { ThemeTokens } from './theme-tokens';

const tokens: ThemeTokens = {
	card: '#ffffff',
	foreground: '#18181b',
	mutedForeground: '#71717a',
	muted: '#f4f4f5',
	border: '#e4e4e7',
	charts: ['#c61d78', '#2563eb'],
	fontFamily: 'Inter, sans-serif',
};

describe('toSandboxTheme', () => {
	it("gives the mini-app the card's colour as its background", () => {
		expect(toSandboxTheme(tokens, '#c61d78', false)).toEqual({
			dark: false,
			colors: {
				background: '#ffffff',
				foreground: '#18181b',
				muted: '#f4f4f5',
				mutedForeground: '#71717a',
				border: '#e4e4e7',
				primary: '#c61d78',
			},
			charts: ['#c61d78', '#2563eb'],
			fontFamily: 'Inter, sans-serif, ui-sans-serif, system-ui, sans-serif',
		});
	});

	it('copies the chart colours, so the tokens are not shared', () => {
		const theme = toSandboxTheme(tokens, '#c61d78', true);

		expect(theme.charts).not.toBe(tokens.charts);
		expect(theme.dark).toBe(true);
	});
});

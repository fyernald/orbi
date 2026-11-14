import type { SandboxTheme } from '@orbi/shared/mini-app-protocol';
import { describe, expect, it } from 'vitest';
import { errorText } from './error-text';
import { orbiGlobal, themeVariables } from './theme';

const theme: SandboxTheme = {
	dark: true,
	colors: {
		background: '#18181b',
		foreground: '#fafafa',
		muted: '#27272a',
		mutedForeground: '#a1a1aa',
		border: '#3f3f46',
		primary: '#e0559c',
	},
	charts: ['#e0559c', '#60a5fa', '#2dd4bf'],
	fontFamily: 'Inter, sans-serif',
};

describe('themeVariables', () => {
	it('names every colour as the prompt does', () => {
		expect(themeVariables(theme)).toEqual({
			'--orbi-font': 'Inter, sans-serif',
			'--orbi-background': '#18181b',
			'--orbi-foreground': '#fafafa',
			'--orbi-muted': '#27272a',
			'--orbi-muted-foreground': '#a1a1aa',
			'--orbi-border': '#3f3f46',
			'--orbi-primary': '#e0559c',
			'--orbi-chart-1': '#e0559c',
			'--orbi-chart-2': '#60a5fa',
			'--orbi-chart-3': '#2dd4bf',
		});
	});
});

describe('orbiGlobal', () => {
	it('gives the code copies, so it cannot change the theme it was sent', () => {
		const global = orbiGlobal(theme);
		global.charts.push('#000000');

		expect(theme.charts).toHaveLength(3);
		expect(global).toMatchObject({ dark: true, font: 'Inter, sans-serif' });
	});
});

describe('errorText', () => {
	it('reads errors, strings and anything else', () => {
		expect(errorText(new TypeError('x is not a function'))).toBe(
			'x is not a function'
		);
		expect(errorText('Uncaught  boom\n here')).toBe('Uncaught boom here');
		expect(errorText({ code: 1 })).toBe(
			'Something went wrong in the mini-app.'
		);
	});

	it('cuts a long error to one short line', () => {
		const text = errorText('x'.repeat(1000));

		expect(text).toHaveLength(300);
		expect(text.endsWith('…')).toBe(true);
	});
});

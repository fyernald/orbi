import { describe, expect, it } from 'vitest';
import {
	isHostMessage,
	isParentMessage,
	isRunMessage,
	type SandboxTheme,
} from './mini-app-protocol';

const theme: SandboxTheme = {
	dark: false,
	colors: {
		background: '#ffffff',
		foreground: '#111111',
		muted: '#f4f4f5',
		mutedForeground: '#71717a',
		border: '#e4e4e7',
		primary: '#c61d78',
	},
	charts: ['#c61d78', '#2563eb'],
	fontFamily: 'Inter, sans-serif',
};

const app = { html: '', css: '', js: 'go()', libraries: ['d3'] };

describe('isRunMessage', () => {
	it('takes the code and the theme', () => {
		expect(isRunMessage({ type: 'run', app, theme })).toBe(true);
	});

	it('refuses a library the sandbox does not serve', () => {
		expect(
			isRunMessage({ type: 'run', app: { ...app, libraries: ['x'] }, theme })
		).toBe(false);
	});

	it('refuses a theme with a colour missing', () => {
		const { primary: _, ...colors } = theme.colors;
		expect(
			isRunMessage({ type: 'run', app, theme: { ...theme, colors } })
		).toBe(false);
	});

	it('refuses anything else', () => {
		expect(isRunMessage(null)).toBe(false);
		expect(isRunMessage('run')).toBe(false);
		expect(isRunMessage({ type: 'ping' })).toBe(false);
	});
});

describe('isParentMessage', () => {
	it('takes a ping and a new theme', () => {
		expect(isParentMessage({ type: 'ping' })).toBe(true);
		expect(isParentMessage({ type: 'theme', theme })).toBe(true);
	});

	it('refuses a theme message without a theme', () => {
		expect(isParentMessage({ type: 'theme' })).toBe(false);
	});
});

describe('isHostMessage', () => {
	it('takes every message the sandbox sends', () => {
		expect(isHostMessage({ type: 'ready' })).toBe(true);
		expect(isHostMessage({ type: 'pong' })).toBe(true);
		expect(isHostMessage({ type: 'height', height: 240 })).toBe(true);
		expect(isHostMessage({ type: 'error', message: 'x is not defined' })).toBe(
			true
		);
	});

	it('refuses a height that is not a number', () => {
		expect(isHostMessage({ type: 'height', height: Infinity })).toBe(false);
		expect(isHostMessage({ type: 'height', height: '240' })).toBe(false);
	});

	it('refuses unknown messages', () => {
		expect(isHostMessage({ type: 'navigate', url: 'https://x' })).toBe(false);
		expect(isHostMessage(undefined)).toBe(false);
	});
});

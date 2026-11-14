// How the chat page and the sandbox page talk about a mini-app (US-42 part 4).
// The sandbox page imports this file on its own (@orbi/shared/mini-app-protocol),
// so it holds no schemas: only types, constants and plain checks.

// the libraries a mini-app may load; the sandbox serves pinned copies of them
export const MINI_APP_LIBRARIES = ['chart.js', 'd3', 'p5'] as const;
export type MiniAppLibrary = (typeof MINI_APP_LIBRARIES)[number];

// where the sandbox serves each library
export const MINI_APP_LIBRARY_PATHS: Record<MiniAppLibrary, string> = {
	'chart.js': '/libs/chart.js',
	d3: '/libs/d3.js',
	p5: '/libs/p5.js',
};

// the code the model wrote, as the sandbox runs it
export type MiniAppCode = {
	html: string;
	css: string;
	js: string;
	libraries: MiniAppLibrary[];
};

export const SANDBOX_COLOR_NAMES = [
	'background',
	'foreground',
	'muted',
	'mutedForeground',
	'border',
	'primary',
] as const;
export type SandboxColorName = (typeof SANDBOX_COLOR_NAMES)[number];

// Orbi's theme, sent into the frame: it becomes --orbi-* CSS variables there
export type SandboxTheme = {
	dark: boolean;
	colors: Record<SandboxColorName, string>;
	// --chart-1 to --chart-6, in their fixed order
	charts: string[];
	fontFamily: string;
};

// sent once with window.postMessage, together with the port for everything after
export type RunMessage = { type: 'run'; app: MiniAppCode; theme: SandboxTheme };

// chat page to sandbox, over the port
export type ParentMessage =
	{ type: 'theme'; theme: SandboxTheme } | { type: 'ping' };

// sandbox to chat page, over the port
export type HostMessage =
	| { type: 'ready' }
	| { type: 'error'; message: string }
	| { type: 'height'; height: number }
	| { type: 'pong' };

// an error from the mini-app is cut to this, so a huge one cannot flood the page
export const SANDBOX_ERROR_MAX_LENGTH = 300;

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const isString = (value: unknown): value is string => typeof value === 'string';

export const isMiniAppLibrary = (value: unknown): value is MiniAppLibrary =>
	(MINI_APP_LIBRARIES as readonly unknown[]).includes(value);

export function isSandboxTheme(value: unknown): value is SandboxTheme {
	if (!isRecord(value) || typeof value.dark !== 'boolean') return false;
	const { colors, charts } = value;
	return (
		isRecord(colors) &&
		SANDBOX_COLOR_NAMES.every((name) => isString(colors[name])) &&
		Array.isArray(charts) &&
		charts.every(isString) &&
		isString(value.fontFamily)
	);
}

export function isMiniAppCode(value: unknown): value is MiniAppCode {
	return (
		isRecord(value) &&
		isString(value.html) &&
		isString(value.css) &&
		isString(value.js) &&
		Array.isArray(value.libraries) &&
		value.libraries.every(isMiniAppLibrary)
	);
}

export const isRunMessage = (data: unknown): data is RunMessage =>
	isRecord(data) &&
	data.type === 'run' &&
	isMiniAppCode(data.app) &&
	isSandboxTheme(data.theme);

export function isParentMessage(data: unknown): data is ParentMessage {
	if (!isRecord(data)) return false;
	if (data.type === 'ping') return true;
	return data.type === 'theme' && isSandboxTheme(data.theme);
}

export function isHostMessage(data: unknown): data is HostMessage {
	if (!isRecord(data)) return false;
	switch (data.type) {
		case 'ready':
		case 'pong':
			return true;
		case 'error':
			return isString(data.message);
		case 'height':
			return typeof data.height === 'number' && Number.isFinite(data.height);
		default:
			return false;
	}
}

import type { SandboxTheme } from '@orbi/shared/mini-app-protocol';
import { themeCharts } from './chart-theme';
import { orbiGlobal, THEME_EVENT, themeVariables } from './theme';

// Puts Orbi's theme into the page: CSS variables, the orbi global and the
// libraries' defaults. On a change it also tells the mini-app, so it can redraw.
export function applyTheme(theme: SandboxTheme) {
	const root = document.documentElement;
	for (const [name, value] of Object.entries(themeVariables(theme))) {
		root.style.setProperty(name, value);
	}
	root.style.colorScheme = theme.dark ? 'dark' : 'light';
	Object.assign(window, { orbi: orbiGlobal(theme) });
	themeCharts(theme);
	window.dispatchEvent(new Event(THEME_EVENT));
}

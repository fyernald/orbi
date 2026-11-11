import {
	MINI_APP_LIBRARY_PATHS,
	type MiniAppLibrary,
} from '@orbi/shared/mini-app-protocol';
import { setUpChartSize } from './chart-size';
import { setUpChartTheme } from './chart-theme';

const loadScript = (src: string) =>
	new Promise<void>((resolve, reject) => {
		const script = document.createElement('script');
		script.src = src;
		// with CORS, so a library's error messages are not hidden (see src/page.ts)
		script.crossOrigin = 'anonymous';
		script.onload = () => resolve();
		script.onerror = () => reject(new Error(`Could not load ${src}.`));
		document.head.append(script);
	});

// the pinned libraries the mini-app asked for, one after another, before its code
export async function loadLibraries(libraries: MiniAppLibrary[]) {
	for (const library of libraries) {
		await loadScript(MINI_APP_LIBRARY_PATHS[library]);
	}
	if (libraries.includes('chart.js')) {
		setUpChartTheme();
		setUpChartSize();
	}
}

type P5Globals = {
	p5?: (new () => unknown) & { instance?: unknown };
	setup?: unknown;
	draw?: unknown;
};

// p5 looks for setup() and draw() as soon as it loads, which is before the
// mini-app's code defines them, so its global mode is started here once they exist.
export function startP5GlobalMode() {
	const { p5, setup, draw } = window as unknown as P5Globals;
	if (!p5 || p5.instance) return;
	if (typeof setup === 'function' || typeof draw === 'function') new p5();
}

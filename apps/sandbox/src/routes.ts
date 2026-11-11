import { fileURLToPath } from 'node:url';
import {
	MINI_APP_LIBRARY_PATHS,
	type MiniAppLibrary,
} from '@orbi/shared/mini-app-protocol';

// What the sandbox serves at each path: the host page, its script, and the pinned
// libraries a mini-app may load. Anything else is a 404.

export type Route =
	| { kind: 'page' }
	| { kind: 'health' }
	| { kind: 'file'; file: string; contentType: string };

const JAVASCRIPT = 'text/javascript; charset=utf-8';

// the files of each library, inside node_modules (each has its own layout)
const LIBRARY_FILES: Record<MiniAppLibrary, string> = {
	'chart.js': 'chart.js/dist/chart.umd.min.js',
	d3: 'd3/dist/d3.min.js',
	p5: 'p5/lib/p5.min.js',
};

// dist/server.js sits next to dist/public and the app's node_modules
export function createRoutes(distDir: URL): Map<string, Route> {
	const routes = new Map<string, Route>([
		['/', { kind: 'page' }],
		['/health', { kind: 'health' }],
		[
			'/host.js',
			{
				kind: 'file',
				file: fileURLToPath(new URL('public/host.js', distDir)),
				contentType: JAVASCRIPT,
			},
		],
	]);
	for (const [library, path] of Object.entries(MINI_APP_LIBRARY_PATHS)) {
		const file = LIBRARY_FILES[library as MiniAppLibrary];
		routes.set(path, {
			kind: 'file',
			file: fileURLToPath(new URL(`../node_modules/${file}`, distDir)),
			contentType: JAVASCRIPT,
		});
	}
	return routes;
}

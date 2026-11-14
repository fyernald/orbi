import { defineConfig, type Options } from 'tsup';

// Two builds: the Node server, and the script of the page mini-apps run in, which
// the server serves as /host.js. The libraries stay in node_modules (src/routes.ts).
// pnpm dev (--watch) starts the server after each server build, and only then.
export default defineConfig(({ watch }): Options[] => [
	{
		entry: { server: 'src/server.ts' },
		format: ['esm'],
		platform: 'node',
		target: 'node22',
		// the two builds run at once, so each cleans only its own folder
		clean: false,
		noExternal: ['@orbi/shared'],
		onSuccess: watch ? 'node dist/server.js' : undefined,
	},
	{
		entry: { host: 'src/host/main.ts' },
		outDir: 'dist/public',
		format: ['iife'],
		outExtension: () => ({ js: '.js' }),
		clean: true,
		platform: 'browser',
		target: 'es2022',
		minify: true,
		noExternal: ['@orbi/shared'],
	},
]);

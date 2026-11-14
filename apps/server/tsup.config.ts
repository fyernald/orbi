import { defineConfig } from 'tsup';

export default defineConfig({
	// the PDF worker is its own file, which a worker thread loads (src/pdf/worker-reader.ts),
	// instrument starts Sentry before the server loads (node --import), and the
	// beta key script runs on its own on the VPS
	entry: {
		index: 'src/index.ts',
		instrument: 'src/instrument.ts',
		'pdf-read-worker': 'src/pdf/read-worker.ts',
		'create-beta-keys': 'src/scripts/create-beta-keys.ts',
	},
	format: ['esm'],
	target: 'node22',
	clean: true,
	noExternal: ['@orbi/core', '@orbi/shared'],
});

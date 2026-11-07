import { defineConfig } from 'tsup';

export default defineConfig({
	// the PDF worker is its own file, which a worker thread loads (src/pdf/worker-reader.ts),
	// and instrument starts Sentry before the server loads (node --import)
	entry: {
		index: 'src/index.ts',
		instrument: 'src/instrument.ts',
		'pdf-read-worker': 'src/pdf/read-worker.ts',
	},
	format: ['esm'],
	target: 'node22',
	clean: true,
	noExternal: ['@orbi/core', '@orbi/shared'],
});

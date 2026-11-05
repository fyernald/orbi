import { defineConfig } from 'tsup';

export default defineConfig({
	// the PDF worker is its own file, which a worker thread loads (src/pdf/worker-reader.ts)
	entry: { index: 'src/index.ts', 'pdf-read-worker': 'src/pdf/read-worker.ts' },
	format: ['esm'],
	target: 'node22',
	clean: true,
	noExternal: ['@orbi/core', '@orbi/shared'],
});

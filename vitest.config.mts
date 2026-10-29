import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		// the client's import alias from apps/client/tsconfig.json
		alias: {
			'@': fileURLToPath(new URL('./apps/client/src', import.meta.url)),
		},
	},
	test: {
		include: ['apps/**/*.test.ts', 'packages/**/*.test.ts'],
		exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
		// starting the in-memory database with its migrations can be slow on a busy machine
		hookTimeout: 30_000,
	},
});

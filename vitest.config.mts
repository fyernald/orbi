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
		// pnpm test:coverage; CI fails when the server falls below the floor
		coverage: {
			provider: 'v8',
			include: ['apps/*/src/**/*.{ts,tsx}', 'packages/*/src/**/*.ts'],
			exclude: ['**/*.test.ts', '**/testing.ts', 'apps/server/src/index.ts'],
			reporter: ['text-summary', 'json-summary', 'html'],
			thresholds: {
				'apps/server/src/**': { lines: 90, branches: 85, functions: 90 },
			},
		},
	},
});

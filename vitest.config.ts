import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['apps/**/*.test.ts', 'packages/**/*.test.ts'],
		exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
		// starting the in-memory database with its migrations can be slow on a busy machine
		hookTimeout: 30_000,
	},
});

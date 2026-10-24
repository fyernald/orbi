import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';
import type { NextConfig } from 'next';

const repoRoot = path.join(process.cwd(), '../../');

// Next.js does not read the root .env, so we take only API_URL from it.
const rootEnvFile = path.join(repoRoot, '.env');
const rootEnv = existsSync(rootEnvFile)
	? parseEnv(readFileSync(rootEnvFile, 'utf8'))
	: {};

// In development the browser talks to Next.js only, and /api/* is forwarded to the Fastify server.
// In production the reverse proxy (Caddy) sends /api/* to the server directly.
const apiUrl =
	process.env.API_URL ?? rootEnv.API_URL ?? 'http://localhost:3001';

const nextConfig: NextConfig = {
	output: 'standalone',
	// Needed so the standalone build can find files from the packages in this monorepo.
	outputFileTracingRoot: repoRoot,
	// These workspace packages are shipped as TypeScript source.
	transpilePackages: ['@orbi/shared', '@orbi/core'],
	async rewrites() {
		return [{ source: '/api/:path*', destination: `${apiUrl}/api/:path*` }];
	},
};

export default nextConfig;

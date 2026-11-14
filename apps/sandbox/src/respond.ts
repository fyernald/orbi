import { readFile } from 'node:fs/promises';
import { securityHeaders } from './headers';
import { HOST_PAGE } from './page';
import type { Route } from './routes';

export type Reply = {
	status: number;
	headers: Record<string, string>;
	body: string | Buffer;
};

// the page is tiny and must pick up a new host.js at once; the scripts may be cached,
// except in development, where host.js is rebuilt
const NO_CACHE = 'no-cache';
const CACHE_AN_HOUR = 'public, max-age=3600';

export type Responder = (method: string, path: string) => Promise<Reply>;

type ResponderOptions = {
	read?: (file: string) => Promise<Buffer>;
	// keep each file after the first read; off in development, where host.js is rebuilt
	cache?: boolean;
};

// Answers one request.
export function createResponder(
	routes: Map<string, Route>,
	appOrigin: string,
	{ read = readFile, cache = true }: ResponderOptions = {}
): Responder {
	const files = new Map<string, Promise<Buffer>>();
	const readFileOf = (file: string) => {
		if (!cache) return read(file);
		if (!files.has(file)) files.set(file, read(file));
		return files.get(file)!;
	};
	const security = securityHeaders(appOrigin);
	const reply = (
		status: number,
		body: string | Buffer,
		headers: Record<string, string>
	): Reply => ({ status, body, headers: { ...security, ...headers } });

	return async (method, path) => {
		if (method !== 'GET' && method !== 'HEAD') {
			return reply(405, 'Method not allowed', { Allow: 'GET, HEAD' });
		}
		const route = routes.get(path);
		switch (route?.kind) {
			case 'page':
				return reply(200, HOST_PAGE, {
					'Content-Type': 'text/html; charset=utf-8',
					'Cache-Control': NO_CACHE,
				});
			case 'health':
				return reply(200, 'ok', { 'Content-Type': 'text/plain' });
			case 'file': {
				return reply(200, await readFileOf(route.file), {
					'Content-Type': route.contentType,
					'Cache-Control': cache ? CACHE_AN_HOUR : NO_CACHE,
					// the sandboxed page's origin is opaque, so it can only be any origin
					'Access-Control-Allow-Origin': '*',
				});
			}
			default:
				return reply(404, 'Not found', { 'Content-Type': 'text/plain' });
		}
	};
}

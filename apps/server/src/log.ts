import type { FastifyRequest } from 'fastify';

// links from auth emails carry a one-time token in the path or the query,
// so request logs keep only the path, with the token masked
export function safeUrl(url: string) {
	const path = url.split('?')[0] ?? url;
	return path.replace(/(\/reset-password\/)[^/]+/, '$1[token]');
}

// the same fields as Fastify's default, apart from the url
export const requestSerializer = (request: FastifyRequest) => ({
	method: request.method,
	url: safeUrl(request.url),
	host: request.host,
	remoteAddress: request.ip,
});

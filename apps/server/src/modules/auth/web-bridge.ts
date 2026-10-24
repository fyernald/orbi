import type { FastifyReply, FastifyRequest } from 'fastify';

// Better Auth speaks the web Request/Response API, Fastify has its own objects.

// the body is sent again as JSON, so its old length and transfer headers no longer apply
const skippedHeaders = new Set([
	'content-length',
	'transfer-encoding',
	'connection',
]);

export function toWebRequest(request: FastifyRequest): Request {
	const headers = new Headers();
	for (const [name, value] of Object.entries(request.headers)) {
		if (value === undefined || skippedHeaders.has(name)) continue;
		for (const item of Array.isArray(value) ? value : [value]) {
			headers.append(name, item);
		}
	}

	const hasBody = request.body !== undefined && request.method !== 'GET';
	return new Request(
		new URL(request.url, `${request.protocol}://${request.host}`),
		{
			method: request.method,
			headers,
			body: hasBody ? JSON.stringify(request.body) : undefined,
		}
	);
}

export async function sendWebResponse(reply: FastifyReply, response: Response) {
	reply.status(response.status);
	response.headers.forEach((value, name) => {
		if (name !== 'set-cookie') reply.header(name, value);
	});

	// several cookies must stay separate headers
	const cookies = response.headers.getSetCookie();
	if (cookies.length > 0) reply.header('set-cookie', cookies);

	return reply.send(response.body ? await response.text() : null);
}

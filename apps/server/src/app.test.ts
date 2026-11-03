import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './testing';

let app: Awaited<ReturnType<typeof createTestApp>>;

beforeAll(async () => {
	app = await createTestApp();
});

afterAll(async () => {
	await app.close();
});

describe('GET /api/health', () => {
	it('answers with status ok', async () => {
		const response = await app.inject({ method: 'GET', url: '/api/health' });

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({ status: 'ok', app: 'Orbi' });
	});
});

describe('behind the proxy', () => {
	// what Fastify made of the request's address and scheme
	async function seenFrom(remoteAddress: string) {
		const proxied = await createTestApp();
		proxied.get('/seen', async (request) => ({
			ip: request.ip,
			protocol: request.protocol,
		}));
		const response = await proxied.inject({
			method: 'GET',
			url: '/seen',
			remoteAddress,
			headers: {
				// the first entry is what the browser sent, the last is what the proxy saw
				'x-forwarded-for': '198.51.100.9, 203.0.113.7',
				'x-forwarded-proto': 'https',
			},
		});
		await proxied.close();
		return response.json();
	}

	it("takes the student's address and the scheme from the proxy", async () => {
		// nginx reaches the container through the Docker network gateway
		expect(await seenFrom('172.18.0.1')).toEqual({
			ip: '203.0.113.7',
			protocol: 'https',
		});
	});

	it('ignores the headers from a client that is not a proxy', async () => {
		expect(await seenFrom('198.51.100.20')).toEqual({
			ip: '198.51.100.20',
			protocol: 'http',
		});
	});
});

describe('unknown routes', () => {
	it('answer 404 in the shared error shape', async () => {
		const response = await app.inject({ method: 'GET', url: '/api/nope' });

		expect(response.statusCode).toBe(404);
		expect(response.json()).toEqual({
			error: { code: 'not_found', message: 'This route does not exist.' },
		});
	});
});

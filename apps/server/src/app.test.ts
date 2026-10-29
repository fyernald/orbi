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

describe('unknown routes', () => {
	it('answer 404 in the shared error shape', async () => {
		const response = await app.inject({ method: 'GET', url: '/api/nope' });

		expect(response.statusCode).toBe(404);
		expect(response.json()).toEqual({
			error: { code: 'not_found', message: 'This route does not exist.' },
		});
	});
});

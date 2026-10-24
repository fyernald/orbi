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

import Fastify from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { registerErrorHandler } from './error-handler';
import {
	ConflictError,
	ForbiddenError,
	NotFoundError,
	ValidationError,
} from './errors';

const app = Fastify();

beforeAll(async () => {
	registerErrorHandler(app);
	app.get('/not-found', async () => {
		throw new NotFoundError('Course not found.');
	});
	app.get('/forbidden', async () => {
		throw new ForbiddenError();
	});
	app.get('/conflict', async () => {
		throw new ConflictError('This course already exists.');
	});
	app.get('/invalid', async () => {
		throw new ValidationError('Name is required.');
	});
	app.get('/crash', async () => {
		throw new Error('connection refused at 10.0.0.5');
	});
	app.post('/echo', async (request) => request.body);
	await app.ready();
});

afterAll(() => app.close());

describe('error handler', () => {
	it.each([
		['/not-found', 404, 'not_found', 'Course not found.'],
		['/forbidden', 403, 'forbidden', 'You cannot do this.'],
		['/conflict', 409, 'conflict', 'This course already exists.'],
		['/invalid', 400, 'validation_error', 'Name is required.'],
	])('turns %s into %i with its code', async (url, status, code, message) => {
		const response = await app.inject({ method: 'GET', url });

		expect(response.statusCode).toBe(status);
		expect(response.json()).toEqual({ error: { code, message } });
	});

	it('hides the details of unknown errors', async () => {
		const response = await app.inject({ method: 'GET', url: '/crash' });

		expect(response.statusCode).toBe(500);
		expect(response.json()).toEqual({
			error: {
				code: 'internal_error',
				message: 'Something went wrong. Please try again.',
			},
		});
	});

	it('answers a broken JSON body with 400 in the same shape', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/echo',
			headers: { 'content-type': 'application/json' },
			payload: '{"name":',
		});

		expect(response.statusCode).toBe(400);
		expect(response.json().error.code).toBe('bad_request');
	});

	it('answers unknown routes with 404 in the same shape', async () => {
		const response = await app.inject({ method: 'GET', url: '/nope' });

		expect(response.statusCode).toBe(404);
		expect(response.json()).toEqual({
			error: { code: 'not_found', message: 'This route does not exist.' },
		});
	});
});

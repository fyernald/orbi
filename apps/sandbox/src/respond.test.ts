import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { readConfig } from './config';
import { contentSecurityPolicy } from './headers';
import { createResponder } from './respond';
import { createRoutes } from './routes';

const APP = 'https://orbi.study';
const routes = createRoutes(pathToFileURL(`${resolve('app', 'dist')}/`));

const responder = () => {
	const read = vi.fn(async (file: string) => Buffer.from(`code of ${file}`));
	return { respond: createResponder(routes, APP, { read }), read };
};

describe('contentSecurityPolicy', () => {
	it('lets a mini-app draw but not reach the network', () => {
		const policy = contentSecurityPolicy(APP);

		expect(policy).toContain("default-src 'none'");
		expect(policy).toContain("connect-src 'none'");
		expect(policy).toContain("form-action 'none'");
		expect(policy).toContain("script-src 'self' 'unsafe-inline'");
		expect(policy).not.toContain('unsafe-eval');
	});

	it('lets only Orbi embed it, and keeps it sandboxed when opened alone', () => {
		const policy = contentSecurityPolicy(APP);

		expect(policy).toContain('frame-ancestors https://orbi.study');
		expect(policy).toContain('sandbox allow-scripts');
		expect(policy).not.toContain('allow-same-origin');
	});
});

describe('createResponder', () => {
	it('serves the host page with the policy on it', async () => {
		const { respond } = responder();

		const reply = await respond('GET', '/');

		expect(reply.status).toBe(200);
		expect(reply.body).toContain(
			'<script src="/host.js" crossorigin="anonymous"></script>'
		);
		expect(reply.headers['Content-Security-Policy']).toBe(
			contentSecurityPolicy(APP)
		);
		expect(reply.headers['Cache-Control']).toBe('no-cache');
	});

	it('serves each library from node_modules and reads it once', async () => {
		const { respond, read } = responder();

		await respond('GET', '/libs/chart.js');
		const reply = await respond('GET', '/libs/chart.js');

		expect(reply.status).toBe(200);
		expect(reply.headers['Content-Type']).toContain('text/javascript');
		expect(reply.headers['Access-Control-Allow-Origin']).toBe('*');
		expect(read).toHaveBeenCalledTimes(1);
		expect(read.mock.calls[0]![0]).toMatch(
			/node_modules[\\/]chart\.js[\\/]dist[\\/]chart\.umd\.min\.js$/
		);
	});

	it('reads a file again each time when the cache is off', async () => {
		const read = vi.fn(async () => Buffer.from('code'));
		const respond = createResponder(routes, APP, { read, cache: false });

		await respond('GET', '/host.js');
		await respond('GET', '/host.js');

		expect(read).toHaveBeenCalledTimes(2);
	});

	it('answers anything else with 404, and other methods with 405', async () => {
		const { respond } = responder();

		expect((await respond('GET', '/libs/jquery.js')).status).toBe(404);
		expect((await respond('GET', '/../package.json')).status).toBe(404);
		expect((await respond('POST', '/')).status).toBe(405);
	});

	it('says it is up for the health check', async () => {
		const { respond } = responder();

		expect(await respond('GET', '/health')).toMatchObject({
			status: 200,
			body: 'ok',
		});
	});
});

describe('readConfig', () => {
	it('defaults to the dev addresses', () => {
		expect(readConfig({})).toEqual({
			host: '127.0.0.1',
			port: 3200,
			appOrigin: 'http://localhost:3000',
		});
	});

	it("keeps only the app address's origin", () => {
		expect(
			readConfig({ APP_ORIGIN: 'https://orbi.study/app', SANDBOX_PORT: '3001' })
		).toMatchObject({ appOrigin: 'https://orbi.study', port: 3001 });
	});

	it('refuses a port that is not a number', () => {
		expect(() => readConfig({ SANDBOX_PORT: 'abc' })).toThrow('SANDBOX_PORT');
	});
});

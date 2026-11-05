import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryMailer } from '../../mail/testing';
import { createTestApp } from '../../testing';
import { cspLogLine } from './routes';

let app: Awaited<ReturnType<typeof createTestApp>>;

beforeAll(async () => {
	app = await createTestApp(createMemoryMailer());
});

afterAll(async () => {
	await app.close();
});

const report = {
	'csp-report': {
		'document-uri':
			'https://orbi.study/app/courses/1?ask=What%20is%20mitosis#chat',
		'blocked-uri': 'https://evil.example/x.js?token=1',
		'violated-directive': 'script-src-elem',
		'effective-directive': 'script-src-elem',
		'source-file': 'https://orbi.study/_next/static/chunks/a.js',
		'line-number': 12,
	},
};

const post = (body: string) =>
	app.inject({
		method: 'POST',
		url: '/api/csp-report',
		headers: { 'content-type': 'application/csp-report' },
		payload: body,
	});

describe('CSP reports', () => {
	it('takes a report without a login', async () => {
		expect((await post(JSON.stringify(report))).statusCode).toBe(204);
	});

	it('takes a broken report without an error', async () => {
		expect((await post('{not json')).statusCode).toBe(204);
	});

	it('logs the pages and files without their query', () => {
		expect(cspLogLine(report)).toEqual({
			directive: 'script-src-elem',
			blocked: 'https://evil.example/x.js',
			page: 'https://orbi.study/app/courses/1',
			source: 'https://orbi.study/_next/static/chunks/a.js',
			line: 12,
		});
	});

	it('logs nothing for something that is not a report', () => {
		expect(cspLogLine({ hello: 'world' })).toBeUndefined();
	});
});

import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy, createNonce } from './csp';

describe('contentSecurityPolicy', () => {
	it("lets only this page's scripts run", () => {
		const policy = contentSecurityPolicy({ nonce: 'abc123', dev: false });

		expect(policy).toContain(
			"script-src 'self' 'nonce-abc123' 'strict-dynamic';"
		);
		expect(policy).not.toContain('unsafe-eval');
		expect(policy).toContain("object-src 'none'");
		expect(policy).toContain("frame-ancestors 'none'");
	});

	it('lets the browser send error reports only to the given address', () => {
		expect(contentSecurityPolicy({ nonce: 'abc123', dev: false })).toContain(
			"connect-src 'self';"
		);
		expect(
			contentSecurityPolicy({
				nonce: 'abc123',
				dev: false,
				reportsTo: 'https://o1.ingest.de.sentry.io',
			})
		).toContain("connect-src 'self' https://o1.ingest.de.sentry.io;");
	});

	it('allows eval in development only', () => {
		expect(contentSecurityPolicy({ nonce: 'abc123', dev: true })).toContain(
			"'strict-dynamic' 'unsafe-eval';"
		);
	});

	it('lets frames come only from this page and the sandbox', () => {
		expect(contentSecurityPolicy({ nonce: 'abc123', dev: false })).toContain(
			"frame-src 'self';"
		);
		expect(
			contentSecurityPolicy({
				nonce: 'abc123',
				dev: false,
				framesFrom: 'https://sandbox.orbi.study',
			})
		).toContain("frame-src 'self' https://sandbox.orbi.study;");
	});
});

describe('createNonce', () => {
	it('is new every time', () => {
		const nonce = createNonce();

		expect(nonce).toMatch(/^[A-Za-z0-9+/]{22}==$/);
		expect(createNonce()).not.toBe(nonce);
	});
});

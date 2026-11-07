import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy, createNonce } from './csp';

describe('contentSecurityPolicy', () => {
	it("lets only this page's scripts run", () => {
		const policy = contentSecurityPolicy('abc123', false);

		expect(policy).toContain(
			"script-src 'self' 'nonce-abc123' 'strict-dynamic';"
		);
		expect(policy).not.toContain('unsafe-eval');
		expect(policy).toContain("object-src 'none'");
		expect(policy).toContain("frame-ancestors 'none'");
	});

	it('lets the browser send error reports only to the given address', () => {
		expect(contentSecurityPolicy('abc123', false)).toContain(
			"connect-src 'self';"
		);
		expect(
			contentSecurityPolicy('abc123', false, 'https://o1.ingest.de.sentry.io')
		).toContain("connect-src 'self' https://o1.ingest.de.sentry.io;");
	});

	it('allows eval in development only', () => {
		expect(contentSecurityPolicy('abc123', true)).toContain(
			"'strict-dynamic' 'unsafe-eval';"
		);
	});
});

describe('createNonce', () => {
	it('is new every time', () => {
		const nonce = createNonce();

		expect(nonce).toMatch(/^[A-Za-z0-9+/]{22}==$/);
		expect(createNonce()).not.toBe(nonce);
	});
});

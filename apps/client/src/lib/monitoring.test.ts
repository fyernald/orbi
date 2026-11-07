import type { ErrorEvent } from '@sentry/nextjs';
import { describe, expect, it } from 'vitest';
import { scrubBreadcrumb, scrubEvent } from './monitoring';

describe('scrubEvent', () => {
	it('keeps the page path and the browser, nothing else of the request or user', () => {
		const event = scrubEvent({
			type: undefined,
			request: {
				url: 'https://orbi.study/reset-password?token=secret#top',
				headers: { 'User-Agent': 'Firefox', Cookie: 'session=abc' },
				cookies: { session: 'abc' },
			},
			user: { id: 'user-1', ip_address: '10.0.0.5' },
		} as ErrorEvent);

		expect(event.request).toEqual({
			url: 'https://orbi.study/reset-password',
			headers: { 'User-Agent': 'Firefox' },
		});
		expect(event.user).toBeUndefined();
	});
});

describe('scrubBreadcrumb', () => {
	it('drops console lines and clicks', () => {
		expect(
			scrubBreadcrumb({ category: 'console', message: 'my notes' })
		).toBeNull();
		expect(
			scrubBreadcrumb({ category: 'ui.click', message: 'button' })
		).toBeNull();
	});

	it('keeps only the path of the pages and requests', () => {
		const breadcrumb = scrubBreadcrumb({
			category: 'navigation',
			data: { from: '/reset-password?token=secret', to: '/app' },
		});

		expect(breadcrumb?.data).toEqual({ from: '/reset-password', to: '/app' });
	});
});

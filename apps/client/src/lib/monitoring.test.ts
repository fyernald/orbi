import type { ErrorEvent } from '@sentry/nextjs';
import { describe, expect, it } from 'vitest';
import {
	sampleRate,
	scrubBreadcrumb,
	scrubEvent,
	scrubSpan,
	sentryOptions,
	tracesSampler,
} from './monitoring';

type Span = Parameters<typeof scrubSpan>[0];

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

describe('sampleRate', () => {
	it('is 0.2 unless the build sets a number from 0 to 1', () => {
		expect(sampleRate(undefined)).toBe(0.2);
		expect(sampleRate('')).toBe(0.2);
		expect(sampleRate('0.05')).toBe(0.05);
		expect(sampleRate('0')).toBe(0);
		expect(sampleRate('2')).toBe(0.2);
		expect(sampleRate('often')).toBe(0.2);
	});
});

const spanOf = (name: string, attributes: Record<string, unknown>): Span => ({
	trace_id: 't',
	span_id: 's',
	name,
	start_timestamp: 0,
	status: 'ok',
	is_segment: true,
	attributes,
});

describe('scrubSpan', () => {
	it('keeps the page and Web Vitals, without the query or the user', () => {
		const span = scrubSpan(
			spanOf('/reset-password?token=secret', {
				'url.full': {
					value: 'https://orbi.study/reset-password?token=secret#top',
					type: 'string',
				},
				'url.query': 'token=secret',
				'user.id': 'user-1',
				'client.address': '{{auto}}',
				'user_agent.original': 'Firefox',
				'browser.web_vital.lcp.value': 1800,
			})
		);

		expect(span.name).toBe('/reset-password');
		expect(span.attributes).toEqual({
			'url.full': 'https://orbi.study/reset-password',
			'user_agent.original': 'Firefox',
			'browser.web_vital.lcp.value': 1800,
		});
	});

	it('keeps only the path of a request to the API', () => {
		const span = scrubSpan(
			spanOf('GET /api/courses?search=biology', {
				'http.url': '/api/courses?search=biology',
				'http.request.header.cookie': 'session=abc',
			})
		);

		expect(span.name).toBe('GET /api/courses');
		expect(span.attributes).toEqual({ 'http.url': '/api/courses' });
	});
});

describe('tracesSampler', () => {
	const sample = tracesSampler(0.2);
	const context = (attributes: Record<string, unknown>) => ({
		name: 'GET',
		attributes,
		inheritOrSampleWith: (rate: number) => rate,
	});

	it('traces a share of page loads and never the health check', () => {
		expect(sample(context({ 'url.path': '/courses/1' }))).toBe(0.2);
		expect(sample(context({ 'url.path': '/health' }))).toBe(0);
	});
});

describe('sentryOptions', () => {
	it('sends the trace only with requests to the API', () => {
		const targets = sentryOptions.tracePropagationTargets as RegExp[];
		const matches = (url: string) => targets.some((target) => target.test(url));

		expect(matches('/api/courses')).toBe(true);
		expect(matches('/courses')).toBe(false);
		expect(matches('https://example.com/api/courses')).toBe(false);
	});

	it('keeps scrubbing what it traces', () => {
		expect(sentryOptions.tracesSampler).toBeDefined();
		expect(sentryOptions.beforeSendSpan).toBe(scrubSpan);
		expect(sentryOptions.dataCollection?.urlQueryParams).toBe(false);
	});
});

import type { ErrorEvent } from '@sentry/node';
import { APICallError, NoObjectGeneratedError } from 'ai';
import { describe, expect, it } from 'vitest';
import { scrubBreadcrumb, scrubEvent } from './error-reporter';

const eventOf = (...values: { type: string; value: string }[]): ErrorEvent => ({
	type: undefined,
	exception: { values },
	request: { url: 'https://orbi.study/api/notes?x=1', data: 'my notes' },
	user: { id: 'user-1', ip_address: '10.0.0.5' },
});

describe('scrubEvent', () => {
	it('sends no request and no user', () => {
		const event = scrubEvent(eventOf({ type: 'Error', value: 'boom' }), {
			originalException: new Error('boom'),
		});

		expect(event.request).toBeUndefined();
		expect(event.user).toBeUndefined();
		expect(event.exception?.values?.[0]?.value).toBe('boom');
	});

	it('keeps only the name of an AI error, which can quote the notes', () => {
		const error = new NoObjectGeneratedError({
			message: 'No object generated: the notes say photosynthesis is ...',
			text: 'photosynthesis is ...',
			response: { id: '1', timestamp: new Date(), modelId: 'm' },
			usage: {} as never,
			finishReason: 'stop',
		});

		const event = scrubEvent(
			eventOf({ type: error.name, value: error.message }),
			{
				originalException: error,
			}
		);

		expect(event.exception?.values?.[0]?.value).toBe(error.name);
	});

	it("keeps the provider's message of an API call error", () => {
		const error = new APICallError({
			message: 'Rate limit reached',
			url: 'https://api.example.com/v1/chat',
			requestBodyValues: { prompt: 'my notes' },
			statusCode: 429,
		});

		const event = scrubEvent(
			eventOf({ type: error.name, value: error.message }),
			{
				originalException: error,
			}
		);

		expect(event.exception?.values?.[0]?.value).toBe('Rate limit reached');
	});

	it('cuts the values of a failed query that caused the error', () => {
		const cause = {
			type: 'DrizzleQueryError',
			value:
				'Failed query: insert into "note" ("content") values ($1)\nparams: my notes',
		};

		const event = scrubEvent(
			eventOf(cause, { type: 'Error', value: 'save failed' }),
			{
				originalException: new Error('save failed'),
			}
		);

		expect(event.exception?.values?.[0]?.value).toBe(
			'Failed query: insert into "note" ("content") values ($1)'
		);
		expect(event.exception?.values?.[1]?.value).toBe('save failed');
	});

	it('collapses an AI error cause to its name', () => {
		const cause = {
			type: 'AI_TypeValidationError',
			value: 'Value: {"text":"my notes"}',
		};

		const event = scrubEvent(
			eventOf(cause, { type: 'Error', value: 'reply failed' }),
			{
				originalException: new Error('reply failed'),
			}
		);

		expect(event.exception?.values?.[0]?.value).toBe('AI_TypeValidationError');
	});
});

describe('scrubBreadcrumb', () => {
	it('drops console lines', () => {
		expect(
			scrubBreadcrumb({ category: 'console', message: 'my notes' })
		).toBeNull();
	});

	it('keeps only the path of a url', () => {
		const breadcrumb = scrubBreadcrumb({
			category: 'http',
			data: {
				url: 'https://orbi.study/api/reset-password/abc123?callbackURL=x',
			},
		});

		expect(breadcrumb?.data?.url).toBe(
			'https://orbi.study/api/reset-password/[token]'
		);
	});
});

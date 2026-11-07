import type { ErrorEvent } from '@sentry/node';
type Span = Parameters<typeof scrubSpan>[0];
import { APICallError, NoObjectGeneratedError } from 'ai';
import { describe, expect, it } from 'vitest';
import {
	scrubBreadcrumb,
	scrubEvent,
	scrubSpan,
	sentryOptions,
	tracesSampler,
} from './error-reporter';

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
	it('keeps the route and the path, without the query or the reset token', () => {
		const span = scrubSpan(
			spanOf('GET /api/reset-password/abc123?callbackURL=x', {
				'http.route': '/api/reset-password/:token',
				'url.path': {
					value: '/api/reset-password/abc123?callbackURL=x',
					type: 'string',
				},
				'url.full': 'https://orbi.study/api/notes/42?q=photosynthesis',
				'http.response.status_code': 200,
			})
		);

		expect(span.name).toBe('GET /api/reset-password/[token]');
		expect(span.attributes).toEqual({
			'http.route': '/api/reset-password/[token]',
			'url.path': '/api/reset-password/[token]',
			'url.full': 'https://orbi.study/api/notes/42',
			'http.response.status_code': 200,
		});
	});

	it('drops the user, the query, headers, bodies and cookies', () => {
		const span = scrubSpan(
			spanOf('GET /api/notes/:id', {
				'user.id': 'user-1',
				'user.email': 'ada@example.com',
				'client.address': '10.0.0.5',
				'url.query': 'q=photosynthesis',
				'http.request.header.cookie': 'session=abc',
				'http.request.body': 'my notes',
				'sentry.op': 'http.server',
			})
		);

		expect(span.attributes).toEqual({ 'sentry.op': 'http.server' });
	});

	it('keeps the model and the tokens of an AI call, never the prompt or reply', () => {
		const span = scrubSpan(
			spanOf('chat deepseek-chat', {
				'gen_ai.request.model': 'deepseek-chat',
				'gen_ai.usage.input_tokens': 1200,
				'gen_ai.operation.name': 'chat',
				'gen_ai.input.messages': '[{"role":"user","content":"my notes"}]',
				'gen_ai.output.messages': 'Photosynthesis is ...',
				'gen_ai.system_instructions': 'You are a tutor. Notes: ...',
				'gen_ai.tool.call.arguments': '{"answer":"B"}',
				'ai.prompt': 'my notes',
				'vercel.ai.telemetry.metadata.topic': 'Biology',
			})
		);

		expect(span.attributes).toEqual({
			'gen_ai.request.model': 'deepseek-chat',
			'gen_ai.usage.input_tokens': 1200,
			'gen_ai.operation.name': 'chat',
		});
	});

	it('leaves a database span as it is, with the query text but no values', () => {
		const attributes = {
			'db.query.text': 'select "id" from "notes" where "id" = $1',
			'db.system.name': 'postgresql',
		};

		expect(scrubSpan(spanOf('SELECT notes', attributes)).attributes).toEqual(
			attributes
		);
	});
});

describe('tracesSampler', () => {
	const sample = tracesSampler(0.2);
	const context = (attributes: Record<string, unknown>) => ({
		name: 'GET',
		attributes,
		inheritOrSampleWith: (rate: number) => rate,
	});

	it('traces a share of requests, or what the browser decided', () => {
		expect(sample(context({ 'url.path': '/api/notes/42' }))).toBe(0.2);
		expect(
			sample({
				...context({ 'url.path': '/api/notes/42' }),
				inheritOrSampleWith: () => 1,
			})
		).toBe(1);
	});

	it('never traces the health check', () => {
		expect(sample(context({ 'url.path': '/api/health' }))).toBe(0);
		expect(
			sample({
				...context({}),
				normalizedRequest: { url: '/api/health?x=1' },
			})
		).toBe(0);
	});
});

describe('sentryOptions', () => {
	const options = sentryOptions({
		dsn: 'https://key@o1.ingest.de.sentry.io/2',
		tracesSampleRate: 0.2,
	});

	it('keeps every data setting off while tracing', () => {
		expect(options.tracesSampler).toBeDefined();
		expect(options.dataCollection).toMatchObject({
			userInfo: false,
			cookies: false,
			httpHeaders: false,
			httpBodies: [],
			urlQueryParams: false,
			genAI: { inputs: false, outputs: false },
			databaseQueryData: false,
		});
		expect(options.beforeSendSpan).toBe(scrubSpan);
	});

	it('leaves 500 answers to error-handler.ts, so each is reported once', () => {
		type FastifyIntegration = {
			name: string;
			setupOnce(): void;
			getShouldHandleError(): (...args: unknown[]) => boolean;
		};
		const integrations = options.integrations as FastifyIntegration[];
		const fastify = integrations.find(({ name }) => name === 'Fastify')!;
		fastify.setupOnce();
		expect(fastify.getShouldHandleError()(new Error('boom'))).toBe(false);
	});
});

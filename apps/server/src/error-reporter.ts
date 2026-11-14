import * as Sentry from '@sentry/node';
import type {
	Breadcrumb,
	ErrorEvent,
	EventHint,
	Exception,
} from '@sentry/node';
import type { SentryConfig } from './config';
import { safeUrl, serializeError } from './log';

// route is where it happened, for example "POST /api/chats/:chatId/messages"
export type ReportError = (error: unknown, route?: string) => void;

export interface ErrorReporter {
	report: ReportError;
	// sends what is still waiting, before the process stops
	flush(): Promise<void>;
}

// used when Sentry is off: local runs, tests, and production without a DSN
export const noErrorReporter: ErrorReporter = {
	report() {},
	flush: async () => {},
};

// What Sentry may collect (decision 0004): the error, its stack, the route, and how long
// each step of a request took. No cookies, headers, bodies, query strings, user, AI
// prompts or replies, query values, or local variables, so nothing a student wrote
// leaves the server this way.
const dataCollection: NonNullable<Sentry.NodeOptions['dataCollection']> = {
	userInfo: false,
	cookies: false,
	httpHeaders: false,
	httpBodies: [],
	urlQueryParams: false,
	genAI: { inputs: false, outputs: false },
	databaseQueryData: false,
	stackFrameVariables: false,
};

// The causes of an error are sent too, so they follow the same rules as the logs: an AI
// SDK error can quote the notes and chat, and a failed query lists its values.
function scrubException(exception: Exception): Exception {
	const type = exception.type ?? '';
	if (type.startsWith('AI_') && type !== 'AI_APICallError') {
		return { ...exception, value: type };
	}
	if (type === 'DrizzleQueryError' && exception.value) {
		return { ...exception, value: exception.value.split('\nparams:')[0] };
	}
	return exception;
}

export function scrubEvent(event: ErrorEvent, hint: EventHint): ErrorEvent {
	const values = event.exception?.values?.map(scrubException);
	// the last one is the error that was thrown; log.ts knows what of it is safe
	const thrown = hint.originalException;
	if (values?.length && thrown instanceof Error) {
		const last = values.length - 1;
		values[last] = { ...values[last], value: serializeError(thrown).message };
	}
	return {
		...event,
		exception: values ? { ...event.exception, values } : event.exception,
		request: undefined,
		user: undefined,
	};
}

// console lines are not scrubbed like the logs, and urls keep only their path
export function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
	if (breadcrumb.category === 'console') return null;
	const url = breadcrumb.data?.url;
	if (typeof url !== 'string') return breadcrumb;
	return { ...breadcrumb, data: { ...breadcrumb.data, url: safeUrl(url) } };
}

type StreamedSpan = Parameters<
	NonNullable<Sentry.NodeOptions['beforeSendSpan']>
>[0];

// a url or path, maybe after a method: "GET /api/notes?x=1" or "https://host/a?b"
const urlLike = /^([A-Z]+ )?((?:https?:\/\/|\/)\S*)$/;

const withSafeUrl = (text: string) => {
	const match = urlLike.exec(text);
	return match ? `${match[1] ?? ''}${safeUrl(match[2]!)}` : text;
};

// who sent the request, its query, headers and bodies
const privateAttribute =
	/^(user\.|client\.address$|http\.client_ip$|url\.query$|http\.query$)|header|body|cookie/;

// AI spans keep the model, the token counts and the timing, never the prompt or reply
const aiAttribute = /^(gen_ai|ai|vercel\.ai)\./;
const safeAiAttribute =
	/model|usage|tokens|operation|provider|system$|finish_reason|streaming|response\.id$|tool\.name$/;

const attributeValue = (value: unknown) =>
	value && typeof value === 'object' && 'value' in value ? value.value : value;

// the Sentry settings already leave these out; this is a second check, as for errors
export function scrubSpan(span: StreamedSpan): StreamedSpan {
	const attributes: Record<string, unknown> = {};
	for (const [key, raw] of Object.entries(span.attributes)) {
		if (privateAttribute.test(key)) continue;
		if (aiAttribute.test(key) && !safeAiAttribute.test(key)) continue;
		const value = attributeValue(raw);
		attributes[key] = typeof value === 'string' ? withSafeUrl(value) : raw;
	}
	return {
		...span,
		name: withSafeUrl(span.name),
		attributes: attributes as StreamedSpan['attributes'],
	};
}

type SamplingContext = Parameters<
	NonNullable<Sentry.NodeOptions['tracesSampler']>
>[0];

// A request the browser traced stays traced, so one trace shows both. The Docker
// health check runs every 10 seconds and would use up the free plan, so it never is.
export const tracesSampler =
	(rate: number) =>
	({ attributes, normalizedRequest, inheritOrSampleWith }: SamplingContext) => {
		const path =
			attributeValue(attributes['url.path']) ?? normalizedRequest?.url;
		if (typeof path === 'string' && safeUrl(path).endsWith('/api/health')) {
			return 0;
		}
		return inheritOrSampleWith(rate);
	};

export function sentryOptions({
	dsn,
	release,
	tracesSampleRate,
}: SentryConfig): Sentry.NodeOptions {
	return {
		dsn,
		release,
		environment: 'production',
		tracesSampler: tracesSampler(tracesSampleRate),
		dataCollection,
		// error-handler.ts reports 500 answers already, with the route
		integrations: [
			Sentry.fastifyIntegration({ shouldHandleError: () => false }),
		],
		beforeSend: scrubEvent,
		beforeBreadcrumb: scrubBreadcrumb,
		beforeSendSpan: scrubSpan,
	};
}

// Sentry itself is started by instrument.ts
export const sentryReporter: ErrorReporter = {
	report(error, route) {
		Sentry.captureException(error, route ? { tags: { route } } : undefined);
	},
	async flush() {
		await Sentry.flush(2000);
	},
};

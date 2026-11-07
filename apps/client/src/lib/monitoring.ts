import type * as Sentry from '@sentry/nextjs';
import type { Breadcrumb, ErrorEvent } from '@sentry/nextjs';

// Put into the build (NEXT_PUBLIC_), because the browser needs it. The same value is
// used by the Next.js server, so one GitHub variable sets both.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// error reports go to Sentry only from a production build with a DSN (T-14)
export const sentryEnabled =
	Boolean(dsn) && process.env.NODE_ENV === 'production';

// where the browser sends the reports, for the Content-Security-Policy
export const sentryOrigin = sentryEnabled ? new URL(dsn!).origin : undefined;

// a password reset link carries its token in the query, and ids are the only data in paths
const withoutQuery = (url: string) => url.split(/[?#]/)[0] ?? url;

// The share of page loads and navigations traced for performance, from 0 to 1. Put into
// the build like the DSN; empty or not a number in that range gives 0.2.
export function sampleRate(value: string | undefined): number {
	const rate = value ? Number(value) : Number.NaN;
	return rate >= 0 && rate <= 1 ? rate : 0.2;
}

// a span attribute is a value, or an object with the value in it
const attributeValue = (value: unknown) =>
	value && typeof value === 'object' && 'value' in value ? value.value : value;

type SamplingContext = Parameters<
	NonNullable<Parameters<typeof Sentry.init>[0]['tracesSampler']>
>[0];

// The Docker health check of the Next.js server runs every 10 seconds and would use
// up the free plan, so it is never traced.
export const tracesSampler =
	(rate: number) =>
	({ attributes, normalizedRequest, inheritOrSampleWith }: SamplingContext) => {
		const path =
			attributeValue(attributes['url.path']) ?? normalizedRequest?.url;
		if (typeof path === 'string' && withoutQuery(path).endsWith('/health')) {
			return 0;
		}
		return inheritOrSampleWith(rate);
	};

type StreamedSpan = Parameters<
	NonNullable<Parameters<typeof Sentry.init>[0]['beforeSendSpan']>
>[0];

// a url or path, maybe after a method: "GET /api/notes?x=1" or "https://host/a?b"
const urlLike = /^([A-Z]+ )?((?:https?:\/\/|\/)\S*)$/;

const withoutQueryIn = (text: string) => {
	const match = urlLike.exec(text);
	return match ? `${match[1] ?? ''}${withoutQuery(match[2]!)}` : text;
};

// who is viewing, and the query, headers and bodies of requests
const privateAttribute =
	/^(user\.|client\.address$|http\.client_ip$|url\.query$|http\.query$)|header|body|cookie/;

// Traces keep the page or route, timings and Web Vitals. The Sentry settings already
// leave out queries and the user; this checks again, as for errors.
export function scrubSpan(span: StreamedSpan): StreamedSpan {
	const attributes: Record<string, unknown> = {};
	for (const [key, raw] of Object.entries(span.attributes)) {
		if (privateAttribute.test(key)) continue;
		const value = attributeValue(raw);
		attributes[key] = typeof value === 'string' ? withoutQueryIn(value) : raw;
	}
	return {
		...span,
		name: withoutQueryIn(span.name),
		attributes: attributes as StreamedSpan['attributes'],
	};
}

// What Sentry may see (decision 0004): the error, its stack, the page path, and the
// browser. No cookies, query strings, user, or anything the student typed.
export function scrubEvent(event: ErrorEvent): ErrorEvent {
	const userAgent = event.request?.headers?.['User-Agent'];
	return {
		...event,
		request: event.request?.url
			? {
					url: withoutQuery(event.request.url),
					headers: userAgent ? { 'User-Agent': userAgent } : undefined,
				}
			: undefined,
		user: undefined,
	};
}

// console lines and clicks can show what is on the page; urls keep only their path
export function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
	if (
		breadcrumb.category === 'console' ||
		breadcrumb.category?.startsWith('ui.')
	) {
		return null;
	}
	if (!breadcrumb.data) return breadcrumb;
	const data = { ...breadcrumb.data };
	for (const key of ['url', 'from', 'to']) {
		if (typeof data[key] === 'string') data[key] = withoutQuery(data[key]);
	}
	return { ...breadcrumb, data };
}

export const sentryOptions: Parameters<typeof Sentry.init>[0] = {
	dsn,
	environment: 'production',
	dataCollection: {
		userInfo: false,
		cookies: false,
		// only the browser's name and version, so Sentry can show which browser it was
		httpHeaders: { request: { allow: ['User-Agent'] }, response: false },
		httpBodies: [],
		urlQueryParams: false,
		stackFrameVariables: false,
	},
	tracesSampler: tracesSampler(
		sampleRate(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE)
	),
	// the browser's requests to the API carry the trace, so one trace shows both
	tracePropagationTargets: [/^\/api\//],
	beforeSend: scrubEvent,
	beforeBreadcrumb: scrubBreadcrumb,
	beforeSendSpan: scrubSpan,
};

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
	beforeSend: scrubEvent,
	beforeBreadcrumb: scrubBreadcrumb,
};

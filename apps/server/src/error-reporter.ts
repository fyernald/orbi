import * as Sentry from '@sentry/node';
import type {
	Breadcrumb,
	ErrorEvent,
	EventHint,
	Exception,
} from '@sentry/node';
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

// What Sentry may collect (decision 0004): the error, its stack, and the route. No
// cookies, headers, bodies, query strings, user, AI prompts or replies, query values, or
// local variables, so nothing a student wrote leaves the server this way.
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

export function createSentryReporter({
	dsn,
	release,
}: {
	dsn: string;
	release?: string;
}): ErrorReporter {
	Sentry.init({
		dsn,
		release,
		environment: 'production',
		// errors only: no tracing, so no OpenTelemetry either
		enableOpenTelemetrySetup: false,
		dataCollection,
		beforeSend: scrubEvent,
		beforeBreadcrumb: scrubBreadcrumb,
	});

	return {
		report(error, route) {
			Sentry.captureException(error, route ? { tags: { route } } : undefined);
		},
		async flush() {
			await Sentry.flush(2000);
		},
	};
}

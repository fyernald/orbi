import { AISDKError, APICallError, RetryError } from 'ai';
import { DrizzleQueryError } from 'drizzle-orm/errors';
import type { FastifyRequest } from 'fastify';

// links from auth emails carry a one-time token in the path or the query,
// so request logs keep only the path, with the token masked
export function safeUrl(url: string) {
	const path = url.split('?')[0] ?? url;
	return path.replace(/(\/reset-password\/)[^/]+/, '$1[token]');
}

// the same fields as Fastify's default, apart from the url
export const requestSerializer = (request: FastifyRequest) => ({
	method: request.method,
	url: safeUrl(request.url),
	host: request.host,
	remoteAddress: request.ip,
});

export type LoggedError = {
	type: string;
	message: string;
	stack: string;
	[key: string]: unknown;
};

// a cause of a cause of ... is cut here
const MAX_CAUSES = 5;

// the call stack without the first line, which repeats the message
const stackFrames = (error: Error) =>
	[
		error.name,
		...(error.stack?.split('\n').filter((line) => /^\s+at /.test(line)) ?? []),
	].join('\n');

// pg and PGlite errors have the same fields; detail can hold the whole row
const isPostgresError = (
	error: Error
): error is Error & {
	code: string;
	severity: string;
	constraint?: string;
	table?: string;
	column?: string;
} => typeof Reflect.get(error, 'code') === 'string' && 'severity' in error;

const serializeCause = (cause: unknown, depth: number) =>
	cause instanceof Error ? serializeError(cause, depth + 1) : cause;

// Errors are logged without what the student wrote: an AI error holds the whole request
// to the model (notes and chat), and a failed query holds its values. Other errors are
// logged in full, like Fastify's default.
export function serializeError(error: Error, depth = 0): LoggedError {
	const type = error.name;
	if (depth > MAX_CAUSES) return { type, message: type, stack: '' };

	if (RetryError.isInstance(error)) {
		const attempts = error.errors.length;
		const lastError = serializeCause(error.lastError, depth);
		const last = (lastError as LoggedError | undefined)?.message ?? 'unknown';
		return {
			type,
			message: `Failed after ${attempts} attempts. Last error: ${last}`,
			stack: stackFrames(error),
			reason: error.reason,
			attempts,
			lastError,
		};
	}
	if (APICallError.isInstance(error)) {
		// the message is the provider's, not the prompt
		return {
			type,
			message: error.message,
			stack: stackFrames(error),
			statusCode: error.statusCode,
			isRetryable: error.isRetryable,
			url: error.url.split('?')[0],
		};
	}
	// other AI SDK messages can quote the model's input or output
	if (AISDKError.isInstance(error)) {
		return {
			type,
			message: type,
			stack: stackFrames(error),
			cause: error.cause instanceof Error ? error.cause.name : undefined,
		};
	}
	if (error instanceof DrizzleQueryError) {
		return {
			type,
			message: `Failed query: ${error.query}`,
			stack: stackFrames(error),
			query: error.query,
			cause: serializeCause(error.cause, depth),
		};
	}
	if (isPostgresError(error)) {
		return {
			type,
			message: error.message,
			stack: stackFrames(error),
			code: error.code,
			constraint: error.constraint,
			table: error.table,
			column: error.column,
		};
	}

	return {
		...error,
		type,
		message: error.message,
		stack: error.stack ?? '',
		cause: serializeCause(error.cause, depth),
	};
}

type LogMethod = (...args: unknown[]) => void;

export const loggerOptions = {
	serializers: {
		req: requestSerializer,
		err: (error: Error) => serializeError(error),
	},
	hooks: {
		// pino also writes a logged error's message as the line's msg, outside the serializer
		logMethod(this: unknown, args: unknown[], method: LogMethod) {
			const [first, second] = args;
			if (first instanceof Error && typeof second !== 'string') {
				return method.apply(this, [
					first,
					serializeError(first).message,
					...args.slice(1),
				]);
			}
			return method.apply(this, args);
		},
	},
};

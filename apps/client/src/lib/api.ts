import { z, type ZodType } from 'zod';
import { readJsonLines } from './ndjson';

// a failed API call, with the { error: { code, message } } the server sent
export class ApiError extends Error {
	constructor(
		readonly status: number,
		readonly code: string,
		message: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

const fallbackMessage = 'Something went wrong. Please try again.';

type ErrorBody = { error?: { code?: string; message?: string } } | null;

// Same origin as the app: /api/* reaches the server through the Next.js rewrite in
// development and through nginx in production. Every answer is checked with the shared
// schema, so the types the components get are the types the server really sent.
async function request<T>(
	path: string,
	schema: ZodType<T>,
	init?: RequestInit
): Promise<T> {
	const response = await fetch(`/api${path}`, init);
	const body: unknown = await response.json().catch(() => null);

	if (!response.ok) throw toApiError(response.status, body);
	return schema.parse(body);
}

function toApiError(status: number, body: unknown) {
	const error = (body as ErrorBody)?.error;
	return new ApiError(
		status,
		error?.code ?? 'unknown',
		error?.message ?? fallbackMessage
	);
}

export type UploadProgress = {
	signal: AbortSignal;
	// 0 to 1, how much of the file has been sent
	onProgress: (progress: number) => void;
};

type UploadInput = UploadProgress & { file: Blob; contentType: string };

// fetch cannot tell how much of a file has been sent, so files go up with
// XMLHttpRequest; the file itself is the body
function upload<T>(
	path: string,
	schema: ZodType<T>,
	{ file, contentType, signal, onProgress }: UploadInput
): Promise<T> {
	return new Promise((resolve, reject) => {
		if (signal.aborted) return reject(signal.reason);
		const xhr = new XMLHttpRequest();
		xhr.open('POST', `/api${path}`);
		xhr.setRequestHeader('content-type', contentType);
		xhr.upload.onprogress = (event) => {
			if (event.lengthComputable) onProgress(event.loaded / event.total);
		};
		xhr.onload = () => {
			let body: unknown = null;
			try {
				body = JSON.parse(xhr.responseText);
			} catch {
				// an error page from a proxy is not JSON; the general message is used
			}
			if (xhr.status < 200 || xhr.status >= 300) {
				return reject(toApiError(xhr.status, body));
			}
			try {
				resolve(schema.parse(body));
			} catch (error) {
				reject(error);
			}
		};
		xhr.onerror = () => reject(new Error(fallbackMessage));
		signal.addEventListener(
			'abort',
			() => {
				xhr.abort();
				reject(signal.reason);
			},
			{ once: true }
		);
		xhr.send(file);
	});
}

type StreamInput<T> = {
	body: unknown;
	signal: AbortSignal;
	onEvent: (event: T) => void;
};

// A POST whose answer is one JSON event per line, for a long job that reports
// its progress. An error before it starts comes back like any other request's.
async function stream<T>(
	path: string,
	schema: ZodType<T>,
	{ body, signal, onEvent }: StreamInput<T>
): Promise<void> {
	const response = await fetch(`/api${path}`, {
		...withJson('POST', body),
		signal,
	});
	if (!response.ok || !response.body) {
		throw toApiError(response.status, await response.json().catch(() => null));
	}
	await readJsonLines(response.body, (value) => onEvent(schema.parse(value)));
}

const withJson = (method: string, body: unknown): RequestInit =>
	body === undefined
		? { method }
		: {
				method,
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(body),
			};

// use it only through the feature hooks
export const api = {
	get: <T>(path: string, schema: ZodType<T>) => request(path, schema),
	post: <T>(path: string, schema: ZodType<T>, body?: unknown) =>
		request(path, schema, withJson('POST', body)),
	patch: <T>(path: string, schema: ZodType<T>, body: unknown) =>
		request(path, schema, withJson('PATCH', body)),
	// the server answers 204 with no body
	delete: (path: string) => request(path, z.null(), { method: 'DELETE' }),
	upload,
	stream,
};

// the server writes its messages for users; anything else (offline, a crash) gets a general one
export function apiErrorMessage(error: unknown): string | undefined {
	if (!error) return undefined;
	return error instanceof ApiError ? error.message : fallbackMessage;
}

// a 4xx answer (not found, not allowed) will not change by asking again
export const isClientErrorStatus = (status: number) =>
	status >= 400 && status < 500;

export const isClientError = (error: unknown) =>
	error instanceof ApiError && isClientErrorStatus(error.status);

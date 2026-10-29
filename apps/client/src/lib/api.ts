import { z, type ZodType } from 'zod';

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

	if (!response.ok) {
		const error = (body as ErrorBody)?.error;
		throw new ApiError(
			response.status,
			error?.code ?? 'unknown',
			error?.message ?? fallbackMessage
		);
	}
	return schema.parse(body);
}

// use it only through the feature hooks
export const api = {
	get: <T>(path: string, schema: ZodType<T>) => request(path, schema),
	post: <T>(path: string, schema: ZodType<T>, body: unknown) =>
		request(path, schema, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body),
		}),
	// the server answers 204 with no body
	delete: (path: string) => request(path, z.null(), { method: 'DELETE' }),
};

// the server writes its messages for users; anything else (offline, a crash) gets a general one
export function apiErrorMessage(error: unknown): string | undefined {
	if (!error) return undefined;
	return error instanceof ApiError ? error.message : fallbackMessage;
}

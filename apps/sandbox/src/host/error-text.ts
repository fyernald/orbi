import { SANDBOX_ERROR_MAX_LENGTH } from '@orbi/shared/mini-app-protocol';

// An error from the mini-app as one short line for the chat page. Anything can be
// thrown, so it is turned into text first.
export function errorText(error: unknown): string {
	const text =
		error instanceof Error
			? error.message
			: typeof error === 'string'
				? error
				: 'Something went wrong in the mini-app.';
	const line = text.replace(/\s+/g, ' ').trim() || 'Unknown error';
	return line.length > SANDBOX_ERROR_MAX_LENGTH
		? `${line.slice(0, SANDBOX_ERROR_MAX_LENGTH - 1)}…`
		: line;
}

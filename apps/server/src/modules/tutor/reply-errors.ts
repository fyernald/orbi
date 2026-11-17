import { APICallError, RetryError } from 'ai';

export type ReplyStop = {
	// the student pressed Stop or closed the tab
	stoppedByStudent: boolean;
	// the model did not start answering in time (see first-output-timeout.ts)
	slowToStart: boolean;
};

// A timeout ends the stream with an abort, like the student's Stop button, so an
// abort the student did not ask for becomes an error. Both kinds usually mean the
// AI service is overloaded.
export function timeoutAsError<Chunk extends { type: string }>(
	chunk: Chunk,
	{ stoppedByStudent, slowToStart }: ReplyStop
): Chunk | { type: 'error'; errorText: string } {
	if (chunk.type !== 'abort' || stoppedByStudent) return chunk;
	return {
		type: 'error',
		errorText: slowToStart
			? 'This model is slow to answer right now. Try again, or pick another model.'
			: 'The AI service stopped answering partway. Try again, or pick another model.',
	};
}

// the student sees this text; provider details go to the log only. fallback
// is for an error none of the known kinds
export function replyErrorMessage(
	error: unknown,
	fallback = 'Orbi could not answer. Try again.'
): string {
	// after its retries the AI SDK wraps the provider's error
	const cause = RetryError.isInstance(error) ? error.lastError : error;
	if (
		cause instanceof Error &&
		['TimeoutError', 'AbortError'].includes(cause.name)
	) {
		return 'Orbi took too long to answer. Try again.';
	}
	if (APICallError.isInstance(cause)) {
		const status = cause.statusCode ?? 0;
		// a short rate limit and a used-up daily quota both answer 429
		if (status === 429) {
			return 'This model has reached its limit for now. Try again later, or pick another model.';
		}
		if (status === 403 || status === 404) {
			return 'This model is not available right now. Pick another model.';
		}
		if (status >= 500) {
			return 'The AI service is having problems. Try again in a minute.';
		}
	}
	return fallback;
}

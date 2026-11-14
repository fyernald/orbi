import type { KeyPointsEvent } from '@orbi/shared';
import { AppError } from '../../../errors';
import type { KeyPointsJob } from './writer';

const UNEXPECTED = 'Orbi could not write notes from this PDF. Try again.';

// a line every 15 s keeps a proxy from closing the request while a slow part is written
const HEARTBEAT_MS = 15_000;

const encoder = new TextEncoder();

// The key points as one JSON event per line: progress, then the saved notes or an
// error. Cancel (an aborted signal) ends it without an error: the student asked.
// The job logs what is unexpected; the student reads only a service's message.
export function keyPointsStream(
	job: KeyPointsJob,
	signal: AbortSignal,
	heartbeatMs = HEARTBEAT_MS
): ReadableStream<Uint8Array> {
	return new ReadableStream({
		async start(controller) {
			// the browser may be gone already; then there is no one to tell
			const write = (text: string) => {
				try {
					controller.enqueue(encoder.encode(text));
				} catch {
					// closed
				}
			};
			const send = (event: KeyPointsEvent) =>
				write(`${JSON.stringify(event)}\n`);
			const heartbeat = setInterval(() => write('\n'), heartbeatMs);

			send({ type: 'progress', done: 0, total: Math.max(job.total, 1) });
			try {
				const notes = await job.run({
					signal,
					onProgress: (done, total) => send({ type: 'progress', done, total }),
				});
				send({ type: 'done', notes });
			} catch (error) {
				if (!signal.aborted) {
					send({
						type: 'error',
						message: error instanceof AppError ? error.message : UNEXPECTED,
					});
				}
			} finally {
				clearInterval(heartbeat);
				try {
					controller.close();
				} catch {
					// closed
				}
			}
		},
	});
}

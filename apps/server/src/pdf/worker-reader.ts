import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';
import { PDF_MAX_PAGES } from '@orbi/shared';
import {
	PdfReadError,
	type PdfReader,
	type PdfReadErrorReason,
} from './reader';

// The built server has the worker next to it as pdf-read-worker.js (tsup.config.ts);
// from source (pnpm dev, tests) it is the .ts file, which needs tsx to load.
const fromSource = import.meta.url.endsWith('.ts');
const workerUrl = fromSource
	? new URL('./read-worker.ts', import.meta.url)
	: new URL('./pdf-read-worker.js', import.meta.url);
const workerExecArgv = () =>
	fromSource
		? [
				'--import',
				pathToFileURL(createRequire(import.meta.url).resolve('tsx')).href,
			]
		: undefined;

type WorkerAnswer = { pages: string[] } | { reason: PdfReadErrorReason };

// pdf.js reads text with plain JavaScript on one thread. Each PDF is read in its
// own worker thread, so a big or broken file never stops the server from answering
// other students. A read that takes too long or uses too much memory is stopped.
export function createWorkerPdfReader({
	maxPages = PDF_MAX_PAGES,
	timeoutMs = 30_000,
	maxMemoryMb = 256,
}: {
	maxPages?: number;
	timeoutMs?: number;
	maxMemoryMb?: number;
} = {}): PdfReader {
	return {
		readPages(data) {
			return new Promise((resolve, reject) => {
				const worker = new Worker(workerUrl, {
					workerData: { maxPages },
					execArgv: workerExecArgv(),
					resourceLimits: { maxOldGenerationSizeMb: maxMemoryMb },
				});
				let settled = false;
				const finish = (done: () => void) => {
					if (settled) return;
					settled = true;
					clearTimeout(timer);
					void worker.terminate();
					done();
				};
				const timer = setTimeout(
					() => finish(() => reject(new PdfReadError('tooHeavy'))),
					timeoutMs
				);
				worker.once('message', (answer: WorkerAnswer) =>
					finish(() =>
						'pages' in answer
							? resolve(answer.pages)
							: reject(new PdfReadError(answer.reason))
					)
				);
				worker.once('error', (error: Error & { code?: string }) =>
					finish(() =>
						reject(
							error.code === 'ERR_WORKER_OUT_OF_MEMORY'
								? new PdfReadError('tooHeavy')
								: error
						)
					)
				);
				// a copy, so its memory can move to the worker instead of being copied again
				const copy = new Uint8Array(data);
				worker.postMessage(copy, [copy.buffer]);
			});
		},
	};
}

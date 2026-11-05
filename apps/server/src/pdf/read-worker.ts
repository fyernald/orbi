import { parentPort, workerData } from 'node:worker_threads';
import { PdfReadError, readPdfPages } from './reader';

// Runs in a worker thread (worker-reader.ts): reads one PDF and answers with its
// pages, or with why it could not.
const port = parentPort!;
port.once('message', async (data: Uint8Array) => {
	try {
		port.postMessage({ pages: await readPdfPages(data, workerData.maxPages) });
	} catch (error) {
		port.postMessage({
			reason: error instanceof PdfReadError ? error.reason : 'broken',
		});
	}
});

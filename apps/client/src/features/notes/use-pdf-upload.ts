'use client';

import { useEffect, useRef, useState } from 'react';
import { apiErrorMessage } from '@/lib/api';
import { pdfFileError, pdfSavedMessage } from './pdf-file';
import { useUploadPdf, useWriteKeyPoints } from './pdf-hooks';
import type { PdfJob } from './pdf-progress';

export type PdfUploadState =
	| { status: 'idle' }
	| PdfJob
	| { status: 'saved'; message: string }
	| { status: 'error'; message: string };

// a PDF Orbi has read on the topic: the file's hash and its name
export type ReadPdf = { fileHash: string; name: string };

// One PDF at a time for the notes sheet: it goes up, then Orbi writes its key
// points with the model the student picked. Cancel stops either step; nothing
// is saved as a note until Orbi has read the whole file.
export function usePdfUpload(courseId: string, topicId: string) {
	const [state, setState] = useState<PdfUploadState>({ status: 'idle' });
	const running = useRef<AbortController | null>(null);
	const { mutateAsync: upload } = useUploadPdf();
	const writeKeyPoints = useWriteKeyPoints(courseId, topicId);

	const begin = () => {
		running.current?.abort();
		const controller = new AbortController();
		running.current = controller;
		return controller;
	};

	// cancelled by the student, who already sees the row again
	const fail = (controller: AbortController) => (error: unknown) => {
		if (controller.signal.aborted) return;
		setState({ status: 'error', message: apiErrorMessage(error)! });
	};

	const writeWith = async (
		pdf: ReadPdf,
		modelId: string,
		controller: AbortController
	) => {
		setState({ status: 'writing', fileName: pdf.name, done: 0, total: 1 });
		const notes = await writeKeyPoints(
			{ fileHash: pdf.fileHash, modelId },
			{
				signal: controller.signal,
				onProgress: (done, total) =>
					setState({ status: 'writing', fileName: pdf.name, done, total }),
			}
		);
		setState({
			status: 'saved',
			message: pdfSavedMessage(pdf.name, notes.length),
		});
	};

	// a PDF that was read before, without notes yet
	const write = (pdf: ReadPdf, modelId: string) => {
		const controller = begin();
		writeWith(pdf, modelId, controller).catch(fail(controller));
	};

	const start = (file: File, modelId: string) => {
		const error = pdfFileError(file);
		if (error) {
			setState({ status: 'error', message: error });
			return;
		}
		const controller = begin();
		const fileName = file.name;
		setState({ status: 'uploading', fileName, progress: 0 });
		upload({
			courseId,
			topicId,
			file,
			signal: controller.signal,
			onProgress: (progress) =>
				setState({ status: 'uploading', fileName, progress }),
		})
			.then(async ({ fileHash, notes }) => {
				// the same file again: its notes are there already
				if (notes.length > 0) {
					setState({
						status: 'saved',
						message: pdfSavedMessage(fileName, notes.length, true),
					});
					return;
				}
				await writeWith({ fileHash, name: fileName }, modelId, controller);
			})
			.catch(fail(controller));
	};

	const cancel = () => {
		running.current?.abort();
		setState({ status: 'idle' });
	};

	// stops a job that is still running when the sheet closes
	useEffect(() => () => running.current?.abort(), []);

	return { state, start, write, cancel };
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { apiErrorMessage } from '@/lib/api';
import { useUploadPdf } from './hooks';
import { pdfFileError, pdfSavedMessage } from './pdf-file';

export type PdfUploadState =
	| { status: 'idle' }
	| { status: 'uploading'; fileName: string; progress: number }
	| { status: 'saved'; message: string }
	| { status: 'error'; message: string };

// one PDF at a time for the notes sheet: its progress, a way to cancel it, and
// what happened at the end
export function usePdfUpload(courseId: string, topicId: string) {
	const [state, setState] = useState<PdfUploadState>({ status: 'idle' });
	const running = useRef<AbortController | null>(null);
	const { mutateAsync: upload } = useUploadPdf();

	const start = (file: File) => {
		const error = pdfFileError(file);
		if (error) {
			setState({ status: 'error', message: error });
			return;
		}
		const controller = new AbortController();
		running.current = controller;
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
			.then(({ notes, reused }) =>
				setState({
					status: 'saved',
					message: pdfSavedMessage(fileName, notes.length, reused),
				})
			)
			.catch((error: unknown) => {
				// cancelled by the student, who already sees the form again
				if (controller.signal.aborted) return;
				setState({ status: 'error', message: apiErrorMessage(error)! });
			});
	};

	const cancel = () => {
		running.current?.abort();
		setState({ status: 'idle' });
	};

	// stops an upload that is still running when the sheet closes
	useEffect(() => () => running.current?.abort(), []);

	return { state, start, cancel };
}

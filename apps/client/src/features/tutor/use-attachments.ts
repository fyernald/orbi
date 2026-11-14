'use client';

import { useEffect, useRef, useState } from 'react';
import { useUploadPdf } from '@/features/notes/pdf-hooks';
import { apiErrorMessage } from '@/lib/api';
import {
	attachmentError,
	attachmentKind,
	noTopicError,
	type Attachment,
} from './attachments';

// where attached PDFs are saved: a topic of the course, or null when no topic
// is picked (the whole-course chat)
export type AttachmentTarget = { courseId: string; topicId: string } | null;

// the files attached to the note composer, each uploading on its own; Orbi
// keeps a PDF's text on the target topic, out of the notes list, and the tutor
// reads it with the message
export function useAttachments(target: AttachmentTarget) {
	const [attachments, setAttachments] = useState<Attachment[]>([]);
	const uploads = useRef(new Map<string, AbortController>());
	const nextId = useRef(0);
	const { mutateAsync: upload } = useUploadPdf();

	const update = (id: string, changes: Partial<Attachment>) =>
		setAttachments((current) =>
			current.map((item) => (item.id === id ? { ...item, ...changes } : item))
		);

	const startUpload = (
		attachment: Attachment,
		{ courseId, topicId }: NonNullable<AttachmentTarget>
	) => {
		const controller = new AbortController();
		uploads.current.set(attachment.id, controller);
		upload({
			courseId,
			topicId,
			file: attachment.file,
			signal: controller.signal,
			onProgress: (progress) => update(attachment.id, { progress }),
		})
			.then(({ textIds, reused }) =>
				update(attachment.id, {
					status: 'ready',
					progress: 1,
					// the PDF's full text, which the tutor reads with the message
					noteIds: textIds,
					reused,
				})
			)
			.catch((error: unknown) => {
				// removed by the user, so there is nothing to show
				if (controller.signal.aborted) return;
				update(attachment.id, {
					status: 'error',
					error: 'Not saved',
					errorDetail: apiErrorMessage(error),
				});
			})
			.finally(() => uploads.current.delete(attachment.id));
	};

	const add = (files: File[]) => {
		const added = files.map((file): Attachment => {
			const kind = attachmentKind(file);
			const fileError = attachmentError(file, kind);
			const problem = fileError
				? { error: fileError }
				: target
					? {}
					: noTopicError;
			nextId.current += 1;
			return {
				id: String(nextId.current),
				file,
				kind,
				status: problem.error ? 'error' : 'uploading',
				progress: 0,
				...problem,
			};
		});
		setAttachments((current) => [...current, ...added]);
		if (!target) return;
		added
			.filter((attachment) => attachment.status === 'uploading')
			.forEach((attachment) => startUpload(attachment, target));
	};

	const remove = (id: string) => {
		uploads.current.get(id)?.abort();
		setAttachments((current) => current.filter((item) => item.id !== id));
	};

	// stops uploads that are still running when the page is left
	useEffect(() => {
		const running = uploads.current;
		return () => running.forEach((controller) => controller.abort());
	}, []);

	// after a send the saved files are done: their text is in the notes now
	const clearSaved = () =>
		setAttachments((current) =>
			current.filter((item) => item.status !== 'ready')
		);

	return { attachments, add, remove, clearSaved };
}

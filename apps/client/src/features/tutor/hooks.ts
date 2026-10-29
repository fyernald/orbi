'use client';

import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState, type DragEvent } from 'react';
import {
	attachmentError,
	attachmentKind,
	type Attachment,
} from './attachments';
import { uploadAttachment } from './mock-upload';

export function useUploadAttachment() {
	return useMutation({ mutationFn: uploadAttachment });
}

// the files attached to the note composer, each uploading on its own
export function useAttachments() {
	const [attachments, setAttachments] = useState<Attachment[]>([]);
	const uploads = useRef(new Map<string, AbortController>());
	const nextId = useRef(0);
	const { mutateAsync: upload } = useUploadAttachment();

	const update = (id: string, changes: Partial<Attachment>) =>
		setAttachments((current) =>
			current.map((item) => (item.id === id ? { ...item, ...changes } : item))
		);

	const startUpload = (attachment: Attachment) => {
		const controller = new AbortController();
		uploads.current.set(attachment.id, controller);
		upload({
			file: attachment.file,
			signal: controller.signal,
			onProgress: (progress) => update(attachment.id, { progress }),
		})
			.then(() => update(attachment.id, { status: 'ready', progress: 1 }))
			.catch(() => {
				// removed by the user, so there is nothing to show
				if (controller.signal.aborted) return;
				update(attachment.id, {
					status: 'error',
					error: 'Upload failed',
				});
			})
			.finally(() => uploads.current.delete(attachment.id));
	};

	const add = (files: File[]) => {
		const added = files.map((file): Attachment => {
			const kind = attachmentKind(file);
			const error = attachmentError(file, kind) ?? undefined;
			nextId.current += 1;
			return {
				id: String(nextId.current),
				file,
				kind,
				status: error ? 'error' : 'uploading',
				progress: 0,
				error,
			};
		});
		setAttachments((current) => [...current, ...added]);
		added
			.filter((attachment) => attachment.status === 'uploading')
			.forEach(startUpload);
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

	return { attachments, add, remove };
}

const hasFiles = (event: DragEvent | globalThis.DragEvent) =>
	event.dataTransfer?.types.includes('Files') ?? false;

// lets files be dropped on one element; a file dropped anywhere else on the page
// is ignored, instead of the browser opening it and leaving the page
export function useFileDrop(onFiles: (files: File[]) => void) {
	const [isDragging, setIsDragging] = useState(false);
	// dragenter and dragleave also fire for every child, so they are counted
	const depth = useRef(0);

	useEffect(() => {
		const ignore = (event: globalThis.DragEvent) => {
			if (hasFiles(event)) event.preventDefault();
		};
		window.addEventListener('dragover', ignore);
		window.addEventListener('drop', ignore);
		return () => {
			window.removeEventListener('dragover', ignore);
			window.removeEventListener('drop', ignore);
		};
	}, []);

	const stop = () => {
		depth.current = 0;
		setIsDragging(false);
	};

	const dropZoneProps = {
		onDragEnter: (event: DragEvent) => {
			if (!hasFiles(event)) return;
			event.preventDefault();
			depth.current += 1;
			setIsDragging(true);
		},
		onDragOver: (event: DragEvent) => {
			if (!hasFiles(event)) return;
			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';
		},
		onDragLeave: (event: DragEvent) => {
			if (!hasFiles(event)) return;
			depth.current -= 1;
			if (depth.current <= 0) stop();
		},
		onDrop: (event: DragEvent) => {
			if (!hasFiles(event)) return;
			event.preventDefault();
			stop();
			onFiles(Array.from(event.dataTransfer.files));
		},
	};

	return { isDragging, dropZoneProps };
}

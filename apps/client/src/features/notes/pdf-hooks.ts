'use client';

import {
	keyPointsEvent,
	pdfUploadResult,
	savedPdf,
	type KeyPointsInput,
	type Note,
	type SavedPdf,
} from '@orbi/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { pdfsKey } from '@/features/courses/query-keys';
import { usageKey } from '@/features/usage/hooks';
import { api, ApiError, type UploadProgress } from '@/lib/api';
import { notesAdded, notesPath } from './hooks';

const CUT_OFF =
	'The connection was lost before Orbi finished. Try again from the PDF.';

const pdfsPath = (courseId: string, topicId: string) =>
	`${notesPath(courseId, topicId)}/pdfs`;

export type PdfUpload = UploadProgress & {
	courseId: string;
	topicId: string;
	file: File;
};

// The server reads the text and keeps it out of the notes list, for the tutor and
// for the key points; the same file again gives back what was saved. The course
// and topic come with each upload, since the composer can switch topics while a
// file is still going up.
export function useUploadPdf() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ courseId, topicId, file, ...progress }: PdfUpload) =>
			api.upload(
				`${notesPath(courseId, topicId)}/pdf?fileName=${encodeURIComponent(file.name)}`,
				pdfUploadResult,
				{ file, contentType: 'application/pdf', ...progress }
			),
		onSuccess: (_, { courseId, topicId }) =>
			queryClient.invalidateQueries({ queryKey: pdfsKey(courseId, topicId) }),
	});
}

// PDFs Orbi has read on the topic that have no notes yet
export function useUnwrittenPdfs(courseId: string, topicId: string) {
	return useQuery({
		queryKey: pdfsKey(courseId, topicId),
		queryFn: () => api.get(pdfsPath(courseId, topicId), z.array(savedPdf)),
	});
}

// the tutor stops reading it too
export function useDeletePdf(courseId: string, topicId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (fileHash: string) =>
			api.delete(`${pdfsPath(courseId, topicId)}/${fileHash}`),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: pdfsKey(courseId, topicId) }),
	});
}

export type KeyPointsProgress = {
	signal: AbortSignal;
	onProgress: (done: number, total: number) => void;
};

// Orbi writes the key points with the model the student picked; the progress
// comes as it goes, and the notes join the list when they are saved
export function useWriteKeyPoints(courseId: string, topicId: string) {
	const queryClient = useQueryClient();

	return async (
		input: KeyPointsInput,
		{ signal, onProgress }: KeyPointsProgress
	): Promise<Note[]> => {
		let notes: Note[] | undefined;
		let failure: string | undefined;
		try {
			await api.stream(
				`${notesPath(courseId, topicId)}/key-points`,
				keyPointsEvent,
				{
					body: input,
					signal,
					onEvent: (event) => {
						if (event.type === 'progress') onProgress(event.done, event.total);
						else if (event.type === 'done') notes = event.notes;
						else failure = event.message;
					},
				}
			);
		} finally {
			// also after a cancel: the parts written so far count against the limits
			void queryClient.invalidateQueries({ queryKey: usageKey });
			void queryClient.invalidateQueries({
				queryKey: pdfsKey(courseId, topicId),
			});
		}
		if (failure) throw new ApiError(503, 'key_points_failed', failure);
		// the stream ended without its last event: the connection was cut
		if (!notes) throw new ApiError(503, 'key_points_cut', CUT_OFF);
		// the PDF has notes now, so it leaves the list at once
		queryClient.setQueryData<SavedPdf[]>(pdfsKey(courseId, topicId), (pdfs) =>
			pdfs?.filter(({ fileHash }) => fileHash !== input.fileHash)
		);
		await notesAdded(queryClient, courseId, topicId, notes);
		return notes;
	};
}

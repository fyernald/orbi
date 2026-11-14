'use client';

import { note, type VoiceNoteMediaType } from '@orbi/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usageKey } from '@/features/usage/hooks';
import { api } from '@/lib/api';
import { notesAdded, notesPath } from '../hooks';

export type VoiceNoteUpload = {
	audio: Blob;
	mediaType: VoiceNoteMediaType;
	seconds: number;
	modelId: string;
	tidy: boolean;
	signal: AbortSignal;
};

// The recording goes to the server once, which sends it to the student's model
// and keeps only the note it writes
export function useWriteVoiceNote(courseId: string, topicId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			audio,
			mediaType,
			seconds,
			modelId,
			tidy,
			signal,
		}: VoiceNoteUpload) => {
			const query = new URLSearchParams({
				modelId,
				tidy: tidy ? '1' : '0',
				seconds: String(seconds),
			});
			return api.upload(
				`${notesPath(courseId, topicId)}/voice?${query}`,
				note,
				{
					file: audio,
					contentType: mediaType,
					signal,
					// a few seconds of speech are small; Orbi shows that it writes instead
					onProgress: () => {},
				}
			);
		},
		onSuccess: (created) =>
			notesAdded(queryClient, courseId, topicId, [created]),
		// a model call counts against the limits, even one that failed
		onSettled: () => queryClient.invalidateQueries({ queryKey: usageKey }),
	});
}

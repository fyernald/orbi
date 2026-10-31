'use client';

import {
	note,
	type CreateNoteInput,
	type Note,
	type Topic,
} from '@orbi/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
	courseKey,
	coursesKey,
	notesKey,
	topicsKey,
} from '@/features/courses/query-keys';
import { api } from '@/lib/api';

const notesPath = (courseId: string, topicId: string) =>
	`/courses/${courseId}/topics/${topicId}/notes`;

export function useNotes(courseId: string, topicId: string) {
	return useQuery({
		queryKey: notesKey(courseId, topicId),
		queryFn: () => api.get(notesPath(courseId, topicId), z.array(note)),
	});
}

// the new note goes on top, like the server lists them; the topic counts it at
// once, and the course list and the course load again for their counts and activity.
// The notes list loads again too. A request still on its way was sent before the
// insert, so it is cancelled first: otherwise the reload would reuse it and the
// new note would be missing from the list
export function useCreateNote(courseId: string, topicId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateNoteInput) =>
			api.post(notesPath(courseId, topicId), note, input),
		onSuccess: async (created) => {
			const notesQuery = { queryKey: notesKey(courseId, topicId), exact: true };
			await queryClient.cancelQueries(notesQuery);
			queryClient.setQueryData<Note[]>(notesKey(courseId, topicId), (notes) =>
				notes ? [created, ...notes] : notes
			);
			void queryClient.invalidateQueries(notesQuery);
			queryClient.setQueryData<Topic[]>(topicsKey(courseId), (topics) =>
				topics?.map((topic) =>
					topic.id === topicId
						? { ...topic, noteCount: topic.noteCount + 1 }
						: topic
				)
			);
			void queryClient.invalidateQueries({ queryKey: coursesKey, exact: true });
			void queryClient.invalidateQueries({
				queryKey: courseKey(courseId),
				exact: true,
			});
		},
	});
}

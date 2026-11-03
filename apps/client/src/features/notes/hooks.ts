'use client';

import {
	note,
	pdfUploadResult,
	type CreateNoteInput,
	type Note,
	type Topic,
	type UpdateNoteInput,
} from '@orbi/shared';
import {
	useMutation,
	useQuery,
	useQueryClient,
	type QueryClient,
} from '@tanstack/react-query';
import { z } from 'zod';
import {
	courseKey,
	coursesKey,
	notesKey,
	topicsKey,
} from '@/features/courses/query-keys';
import { api, type UploadProgress } from '@/lib/api';

const notesPath = (courseId: string, topicId: string) =>
	`/courses/${courseId}/topics/${topicId}/notes`;

export function useNotes(courseId: string, topicId: string) {
	return useQuery({
		queryKey: notesKey(courseId, topicId),
		queryFn: () => api.get(notesPath(courseId, topicId), z.array(note)),
	});
}

// after notes change, the topic counts them at once, and the course list and the
// course load again for their counts and activity
function notesChanged(
	queryClient: QueryClient,
	courseId: string,
	topicId: string,
	noteChange: number
) {
	queryClient.setQueryData<Topic[]>(topicsKey(courseId), (topics) =>
		topics?.map((topic) =>
			topic.id === topicId
				? { ...topic, noteCount: topic.noteCount + noteChange }
				: topic
		)
	);
	void queryClient.invalidateQueries({ queryKey: coursesKey, exact: true });
	void queryClient.invalidateQueries({
		queryKey: courseKey(courseId),
		exact: true,
	});
}

function useNotesChanged(courseId: string, topicId: string) {
	const queryClient = useQueryClient();
	return (noteChange: number) =>
		notesChanged(queryClient, courseId, topicId, noteChange);
}

// new notes go on top, like the server lists them. The notes list loads again
// too. A request still on its way was sent before the insert, so it is
// cancelled first: otherwise the reload would reuse it and the new notes would
// be missing from the list
async function notesAdded(
	queryClient: QueryClient,
	courseId: string,
	topicId: string,
	created: Note[]
) {
	const notesQuery = { queryKey: notesKey(courseId, topicId), exact: true };
	await queryClient.cancelQueries(notesQuery);
	queryClient.setQueryData<Note[]>(notesKey(courseId, topicId), (notes) =>
		notes ? [...created, ...notes] : notes
	);
	void queryClient.invalidateQueries(notesQuery);
	notesChanged(queryClient, courseId, topicId, created.length);
}

export function useCreateNote(courseId: string, topicId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateNoteInput) =>
			api.post(notesPath(courseId, topicId), note, input),
		onSuccess: (created) =>
			notesAdded(queryClient, courseId, topicId, [created]),
	});
}

export type PdfUpload = UploadProgress & {
	courseId: string;
	topicId: string;
	file: File;
};

// the server reads the text and saves it as one note, or a few for a long PDF;
// the same file again gives back its saved notes. The course and topic come
// with each upload, since the composer can switch topics while a file is still
// going up
export function useUploadPdf() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ courseId, topicId, file, ...progress }: PdfUpload) =>
			api.upload(
				`${notesPath(courseId, topicId)}/pdf?fileName=${encodeURIComponent(file.name)}`,
				pdfUploadResult,
				{ file, contentType: 'application/pdf', ...progress }
			),
		onSuccess: async ({ notes, reused }, { courseId, topicId }) => {
			if (!reused) await notesAdded(queryClient, courseId, topicId, notes);
		},
	});
}

// the note keeps its place in the list, since the list is ordered by creation
export function useUpdateNote(courseId: string, topicId: string) {
	const queryClient = useQueryClient();
	const notesChanged = useNotesChanged(courseId, topicId);
	return useMutation({
		mutationFn: ({ noteId, ...input }: UpdateNoteInput & { noteId: string }) =>
			api.patch(`${notesPath(courseId, topicId)}/${noteId}`, note, input),
		onSuccess: (updated) => {
			queryClient.setQueryData<Note[]>(notesKey(courseId, topicId), (notes) =>
				notes?.map((item) => (item.id === updated.id ? updated : item))
			);
			notesChanged(0);
		},
	});
}

export function useDeleteNote(courseId: string, topicId: string) {
	const queryClient = useQueryClient();
	const notesChanged = useNotesChanged(courseId, topicId);
	return useMutation({
		mutationFn: (noteId: string) =>
			api.delete(`${notesPath(courseId, topicId)}/${noteId}`),
		onSuccess: (_, noteId) => {
			queryClient.setQueryData<Note[]>(notesKey(courseId, topicId), (notes) =>
				notes?.filter((item) => item.id !== noteId)
			);
			notesChanged(-1);
		},
	});
}

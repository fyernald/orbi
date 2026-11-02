'use client';

import { apiErrorMessage } from '@/lib/api';
import { useCreateNote } from '../hooks';
import { useNoteForm } from '../use-note-form';
import { NoteEditor } from './note-editor';

type NoteFormProps = {
	courseId: string;
	topicId: string;
};

// it clears after each save, so several notes can be added in a row
export function NoteForm({ courseId, topicId }: NoteFormProps) {
	const create = useCreateNote(courseId, topicId);
	const form = useNoteForm();

	return (
		<NoteEditor
			form={form}
			onSave={(values) =>
				create.mutate(values, {
					onSuccess: () => {
						form.reset();
						form.setFocus('content');
					},
				})
			}
			pending={create.isPending}
			error={apiErrorMessage(create.error)}
			saveLabel="Save note"
		/>
	);
}

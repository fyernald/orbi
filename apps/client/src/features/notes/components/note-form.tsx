'use client';

import { apiErrorMessage } from '@/lib/api';
import { useCreateNote } from '../hooks';
import { newNoteDraftKey } from '../note-drafts';
import { EMPTY_NOTE, useDraftedNoteForm } from '../use-note-form';
import { NoteEditor } from './note-editor';

type NoteFormProps = {
	courseId: string;
	topicId: string;
};

// it clears after each save, so several notes can be added in a row; text not
// saved yet stays when the student leaves the notes
export function NoteForm({ courseId, topicId }: NoteFormProps) {
	const create = useCreateNote(courseId, topicId);
	const { form, clearDraft } = useDraftedNoteForm(newNoteDraftKey(topicId));

	return (
		<NoteEditor
			form={form}
			onSave={(values) =>
				create.mutate(values, {
					onSuccess: () => {
						form.reset(EMPTY_NOTE);
						clearDraft();
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

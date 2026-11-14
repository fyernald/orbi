'use client';

import type { Note } from '@orbi/shared';
import { apiErrorMessage } from '@/lib/api';
import { useUpdateNote } from '../hooks';
import { editNoteDraftKey } from '../note-drafts';
import { useDraftedNoteForm } from '../use-note-form';
import { NoteEditor } from './note-editor';

type EditNoteFormProps = {
	courseId: string;
	note: Note;
	focusOnOpen: boolean;
	onDone: () => void;
};

// an edit left unsaved opens again with the note; Cancel drops it
export function EditNoteForm({
	courseId,
	note,
	focusOnOpen,
	onDone,
}: EditNoteFormProps) {
	const update = useUpdateNote(courseId, note.topicId);
	const { form, clearDraft } = useDraftedNoteForm(editNoteDraftKey(note.id), {
		title: note.title,
		content: note.content,
	});
	const finish = () => {
		clearDraft();
		onDone();
	};

	return (
		<NoteEditor
			form={form}
			onSave={(values) =>
				update.mutate({ noteId: note.id, ...values }, { onSuccess: finish })
			}
			pending={update.isPending}
			error={apiErrorMessage(update.error)}
			saveLabel="Save changes"
			onCancel={finish}
			focusOnOpen={focusOnOpen}
		/>
	);
}

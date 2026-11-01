'use client';

import type { Note } from '@orbi/shared';
import { apiErrorMessage } from '@/lib/api';
import { useUpdateNote } from '../hooks';
import { useNoteForm } from '../use-note-form';
import { NoteEditor } from './note-editor';

type EditNoteFormProps = {
	courseId: string;
	note: Note;
	onDone: () => void;
};

export function EditNoteForm({ courseId, note, onDone }: EditNoteFormProps) {
	const update = useUpdateNote(courseId, note.topicId);
	const form = useNoteForm({ title: note.title, content: note.content });

	return (
		<NoteEditor
			form={form}
			onSave={(values) =>
				update.mutate({ noteId: note.id, ...values }, { onSuccess: onDone })
			}
			pending={update.isPending}
			error={apiErrorMessage(update.error)}
			saveLabel="Save changes"
			onCancel={onDone}
			focusOnOpen
		/>
	);
}

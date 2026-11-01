'use client';

import type { Note } from '@orbi/shared';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { apiErrorMessage } from '@/lib/api';
import { useDeleteNote } from '../hooks';

type DeleteNoteDialogProps = {
	courseId: string;
	note: Note;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

// the questions already made from it belong to the topic, so they stay
export function DeleteNoteDialog({
	courseId,
	note,
	open,
	onOpenChange,
}: DeleteNoteDialogProps) {
	const remove = useDeleteNote(courseId, note.topicId);

	return (
		<ConfirmDeleteDialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (!next) remove.reset();
			}}
			title={`Delete ${note.title}?`}
			description="Questions already made from it stay in the topic. This cannot be undone."
			confirmLabel="Delete note"
			pending={remove.isPending}
			error={apiErrorMessage(remove.error)}
			onConfirm={() =>
				remove.mutate(note.id, { onSuccess: () => onOpenChange(false) })
			}
		/>
	);
}

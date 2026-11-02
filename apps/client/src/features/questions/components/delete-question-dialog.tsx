'use client';

import type { Question } from '@orbi/shared';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { apiErrorMessage } from '@/lib/api';
import { useDeleteQuestion } from '../topic-hooks';

type DeleteQuestionDialogProps = {
	courseId: string;
	question: Question;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

// the answers to the question go with it (ON DELETE CASCADE)
export function DeleteQuestionDialog({
	courseId,
	question,
	open,
	onOpenChange,
}: DeleteQuestionDialogProps) {
	const remove = useDeleteQuestion(courseId, question.topicId);

	return (
		<ConfirmDeleteDialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (!next) remove.reset();
			}}
			title="Delete this question?"
			description="It leaves your study sessions, and your answers to it are deleted too. This cannot be undone."
			confirmLabel="Delete question"
			pending={remove.isPending}
			error={apiErrorMessage(remove.error)}
			onConfirm={() =>
				remove.mutate(question.id, { onSuccess: () => onOpenChange(false) })
			}
		/>
	);
}

'use client';

import type { ChatSummary } from '@orbi/shared';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { useDeleteChat } from '@/features/tutor/hooks';
import { apiErrorMessage } from '@/lib/api';

type DeleteChatDialogProps = {
	chat: ChatSummary;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	// closes the chat; the next newest one, or an empty one, opens instead
	onDeleted: (chatId: string) => void;
};

export function DeleteChatDialog({
	chat,
	open,
	onOpenChange,
	onDeleted,
}: DeleteChatDialogProps) {
	const remove = useDeleteChat(chat.courseId, onDeleted);

	return (
		<ConfirmDeleteDialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (!next) remove.reset();
			}}
			title={`Delete "${chat.title}"?`}
			description="The chat and its messages are deleted, and this cannot be undone. Practice questions made in it stay with the topic."
			confirmLabel="Delete chat"
			pending={remove.isPending}
			error={apiErrorMessage(remove.error)}
			onConfirm={() =>
				remove.mutate(chat.id, { onSuccess: () => onOpenChange(false) })
			}
		/>
	);
}

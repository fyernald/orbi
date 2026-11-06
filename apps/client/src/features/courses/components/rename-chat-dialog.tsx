'use client';

import { renameChatInput, type ChatSummary } from '@orbi/shared';
import { z } from 'zod';
import { RenameDialog } from '@/components/rename-dialog';
import { useRenameChat } from '@/features/tutor/hooks';
import { apiErrorMessage } from '@/lib/api';

// the rename dialog edits a "name"; the API calls it the title
const chatName = z.object({ name: renameChatInput.shape.title });

type RenameChatDialogProps = {
	chat: ChatSummary;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function RenameChatDialog({
	chat,
	open,
	onOpenChange,
}: RenameChatDialogProps) {
	const rename = useRenameChat(chat.courseId);

	return (
		<RenameDialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (!next) rename.reset();
			}}
			title="Rename chat"
			label="Chat name"
			name={chat.title}
			schema={chatName}
			pending={rename.isPending}
			error={apiErrorMessage(rename.error)}
			onSave={(title) =>
				rename.mutate(
					{ chatId: chat.id, title },
					{ onSuccess: () => onOpenChange(false) }
				)
			}
		/>
	);
}

'use client';

import type { Topic } from '@orbi/shared';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { apiErrorMessage } from '@/lib/api';
import { topicDeletes } from '../deletion';
import { useDeleteTopic } from '../hooks';

type DeleteTopicDialogProps = {
	topic: Topic;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function DeleteTopicDialog({
	topic,
	open,
	onOpenChange,
}: DeleteTopicDialogProps) {
	const remove = useDeleteTopic(topic.courseId);

	return (
		<ConfirmDeleteDialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (!next) remove.reset();
			}}
			title={`Delete ${topic.name}?`}
			description="The topic is removed from this course, and this cannot be undone. These go with it:"
			consequences={topicDeletes(topic)}
			confirmLabel="Delete topic"
			pending={remove.isPending}
			error={apiErrorMessage(remove.error)}
			onConfirm={() =>
				remove.mutate(topic.id, { onSuccess: () => onOpenChange(false) })
			}
		/>
	);
}

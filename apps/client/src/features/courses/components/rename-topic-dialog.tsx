'use client';

import { createTopicInput, type Topic } from '@orbi/shared';
import { RenameDialog } from '@/components/rename-dialog';
import { apiErrorMessage } from '@/lib/api';
import { useUpdateTopic } from '../hooks';

type RenameTopicDialogProps = {
	topic: Topic;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function RenameTopicDialog({
	topic,
	open,
	onOpenChange,
}: RenameTopicDialogProps) {
	const rename = useUpdateTopic(topic.courseId);

	return (
		<RenameDialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (!next) rename.reset();
			}}
			title="Rename topic"
			label="Topic name"
			name={topic.name}
			schema={createTopicInput}
			pending={rename.isPending}
			error={apiErrorMessage(rename.error)}
			onSave={(name) =>
				rename.mutate(
					{ topicId: topic.id, name },
					{ onSuccess: () => onOpenChange(false) }
				)
			}
		/>
	);
}

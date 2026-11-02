'use client';

import type { Course } from '@orbi/shared';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { apiErrorMessage } from '@/lib/api';
import { courseDeletes } from '../deletion';
import { useDeleteCourse } from '../hooks';

type DeleteCourseDialogProps = {
	course: Course;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	// the course page leaves, because the course is gone
	onDeleted?: () => void;
};

export function DeleteCourseDialog({
	course,
	open,
	onOpenChange,
	onDeleted,
}: DeleteCourseDialogProps) {
	const remove = useDeleteCourse();

	return (
		<ConfirmDeleteDialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (!next) remove.reset();
			}}
			title={`Delete ${course.name}?`}
			description="This cannot be undone. These go with it:"
			consequences={courseDeletes(course)}
			confirmLabel="Delete course"
			// stays busy while the page moves away
			pending={remove.isPending || (remove.isSuccess && !!onDeleted)}
			error={apiErrorMessage(remove.error)}
			onConfirm={() =>
				remove.mutate(course.id, {
					onSuccess: () => (onDeleted ? onDeleted() : onOpenChange(false)),
				})
			}
		/>
	);
}

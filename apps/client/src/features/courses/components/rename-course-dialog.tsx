'use client';

import { renameCourseInput, type Course } from '@orbi/shared';
import { RenameDialog } from '@/components/rename-dialog';
import { apiErrorMessage } from '@/lib/api';
import { useUpdateCourse } from '../hooks';

type RenameCourseDialogProps = {
	course: Course;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function RenameCourseDialog({
	course,
	open,
	onOpenChange,
}: RenameCourseDialogProps) {
	const rename = useUpdateCourse(course.id);

	return (
		<RenameDialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (!next) rename.reset();
			}}
			title="Rename course"
			label="Course name"
			name={course.name}
			schema={renameCourseInput}
			pending={rename.isPending}
			error={apiErrorMessage(rename.error)}
			onSave={(name) =>
				rename.mutate({ name }, { onSuccess: () => onOpenChange(false) })
			}
		/>
	);
}

'use client';

import type { Course } from '@orbi/shared';
import { Ellipsis, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiErrorMessage } from '@/lib/api';
import { useDeleteCourse } from '../hooks';
import { topicCountLabel } from '../topic-count';
import { ConfirmDeleteDialog } from './confirm-delete-dialog';

type CourseActionsProps = {
	course: Course;
	// a table row shows the button only on hover; the course page always shows it
	variant?: 'row' | 'page';
	// the course page leaves, because the course is gone
	onDeleted?: () => void;
};

export function CourseActions({
	course,
	variant = 'page',
	onDeleted,
}: CourseActionsProps) {
	const remove = useDeleteCourse();
	const [confirming, setConfirming] = useState(false);
	const topics =
		course.topicCount === 0
			? 'It has no topics yet.'
			: `Its ${topicCountLabel(course.topicCount)} and their notes go with it.`;

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size={variant === 'row' ? 'icon' : 'icon-lg'}
						aria-label={`Actions for ${course.name}`}
						className="rounded-lg text-muted-foreground"
					>
						<Ellipsis />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-44">
					<DropdownMenuItem
						variant="destructive"
						onSelect={() => setConfirming(true)}
					>
						<Trash2 />
						Delete course
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<ConfirmDeleteDialog
				open={confirming}
				onOpenChange={(open) => {
					setConfirming(open);
					if (!open) remove.reset();
				}}
				title={`Delete ${course.name}?`}
				description={`${topics} This cannot be undone.`}
				confirmLabel="Delete course"
				pending={remove.isPending || (remove.isSuccess && !!onDeleted)}
				error={apiErrorMessage(remove.error)}
				onConfirm={() =>
					remove.mutate(course.id, {
						onSuccess: () => (onDeleted ? onDeleted() : setConfirming(false)),
					})
				}
			/>
		</>
	);
}

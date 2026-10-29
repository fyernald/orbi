'use client';

import type { Course } from '@orbi/shared';
import { Ellipsis, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiErrorMessage } from '@/lib/api';
import { routes } from '@/lib/routes';
import { useDeleteCourse } from '../hooks';
import { topicCountLabel } from '../topic-count';
import { ConfirmDeleteDialog } from './confirm-delete-dialog';

export function CourseActions({ course }: { course: Course }) {
	const router = useRouter();
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
						variant="outline"
						size="icon-lg"
						aria-label="Course actions"
						className="shrink-0 rounded-full bg-card"
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
				pending={remove.isPending || remove.isSuccess}
				error={apiErrorMessage(remove.error)}
				onConfirm={() =>
					remove.mutate(course.id, {
						onSuccess: () => router.replace(routes.courses),
					})
				}
			/>
		</>
	);
}

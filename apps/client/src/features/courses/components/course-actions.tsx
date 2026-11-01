'use client';

import type { Course } from '@orbi/shared';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteCourseDialog } from './delete-course-dialog';
import { RenameCourseDialog } from './rename-course-dialog';

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
	const [dialog, setDialog] = useState<'rename' | 'delete' | null>(null);
	const closeOn = (open: boolean) => !open && setDialog(null);

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
					<DropdownMenuItem onSelect={() => setDialog('rename')}>
						<Pencil />
						Rename course
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						variant="destructive"
						onSelect={() => setDialog('delete')}
					>
						<Trash2 />
						Delete course
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<RenameCourseDialog
				course={course}
				open={dialog === 'rename'}
				onOpenChange={closeOn}
			/>
			<DeleteCourseDialog
				course={course}
				open={dialog === 'delete'}
				onOpenChange={closeOn}
				onDeleted={onDeleted}
			/>
		</>
	);
}

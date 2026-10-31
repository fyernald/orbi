'use client';

import type { Topic } from '@orbi/shared';
import { Ellipsis, NotebookPen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiErrorMessage } from '@/lib/api';
import { useDeleteTopic } from '../hooks';
import { noteCountLabel } from '../note-count';
import { ConfirmDeleteDialog } from './confirm-delete-dialog';

type TopicActionsProps = {
	topic: Topic;
	onOpenNotes: () => void;
};

// the menu button shows on hover and focus, and always on touch screens
export function TopicActions({ topic, onOpenNotes }: TopicActionsProps) {
	const remove = useDeleteTopic(topic.courseId);
	const [confirming, setConfirming] = useState(false);
	const notes =
		topic.noteCount === 0
			? ''
			: ` Its ${noteCountLabel(topic.noteCount).toLowerCase()} go with it.`;

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label={`Actions for ${topic.name}`}
						className="mr-1 shrink-0 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100 pointer-coarse:opacity-100"
					>
						<Ellipsis />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-44">
					<DropdownMenuItem onSelect={onOpenNotes}>
						<NotebookPen />
						Notes
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						variant="destructive"
						onSelect={() => setConfirming(true)}
					>
						<Trash2 />
						Delete topic
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<ConfirmDeleteDialog
				open={confirming}
				onOpenChange={(open) => {
					setConfirming(open);
					if (!open) remove.reset();
				}}
				title={`Delete ${topic.name}?`}
				description={`The topic is removed from this course.${notes} This cannot be undone.`}
				confirmLabel="Delete topic"
				pending={remove.isPending}
				error={apiErrorMessage(remove.error)}
				onConfirm={() =>
					remove.mutate(topic.id, { onSuccess: () => setConfirming(false) })
				}
			/>
		</>
	);
}

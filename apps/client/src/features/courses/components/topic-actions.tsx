'use client';

import type { Topic } from '@orbi/shared';
import { Ellipsis, NotebookPen, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteTopicDialog } from './delete-topic-dialog';
import { RenameTopicDialog } from './rename-topic-dialog';

type TopicActionsProps = {
	topic: Topic;
	onOpenNotes: () => void;
};

// the menu button shows on hover and focus, and always on touch screens
export function TopicActions({ topic, onOpenNotes }: TopicActionsProps) {
	const [dialog, setDialog] = useState<'rename' | 'delete' | null>(null);
	const closeOn = (open: boolean) => !open && setDialog(null);

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
					<DropdownMenuItem onSelect={() => setDialog('rename')}>
						<Pencil />
						Rename topic
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						variant="destructive"
						onSelect={() => setDialog('delete')}
					>
						<Trash2 />
						Delete topic
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<RenameTopicDialog
				topic={topic}
				open={dialog === 'rename'}
				onOpenChange={closeOn}
			/>
			<DeleteTopicDialog
				topic={topic}
				open={dialog === 'delete'}
				onOpenChange={closeOn}
			/>
		</>
	);
}

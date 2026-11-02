'use client';

import type { Note } from '@orbi/shared';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { useRef, useState, type Ref } from 'react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteNoteDialog } from './delete-note-dialog';

type NoteActionsProps = {
	courseId: string;
	note: Note;
	onEdit: () => void;
	// the card puts the focus back here after an edit
	buttonRef?: Ref<HTMLButtonElement>;
};

export function NoteActions({
	courseId,
	note,
	onEdit,
	buttonRef,
}: NoteActionsProps) {
	const [deleting, setDeleting] = useState(false);
	const editPicked = useRef(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						ref={buttonRef}
						variant="ghost"
						size="icon-sm"
						aria-label={`Actions for ${note.title}`}
						className="-my-1 -mr-2 shrink-0 rounded-md text-muted-foreground"
					>
						<Ellipsis />
					</Button>
				</DropdownMenuTrigger>
				{/* after Edit the editor takes the focus, so the menu does not give it back */}
				<DropdownMenuContent
					align="end"
					className="w-40"
					onCloseAutoFocus={(event) => {
						if (editPicked.current) event.preventDefault();
						editPicked.current = false;
					}}
				>
					<DropdownMenuItem
						onSelect={() => {
							editPicked.current = true;
							onEdit();
						}}
					>
						<Pencil />
						Edit note
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						variant="destructive"
						onSelect={() => setDeleting(true)}
					>
						<Trash2 />
						Delete note
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<DeleteNoteDialog
				courseId={courseId}
				note={note}
				open={deleting}
				onOpenChange={setDeleting}
			/>
		</>
	);
}

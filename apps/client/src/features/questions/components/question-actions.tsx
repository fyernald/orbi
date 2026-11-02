'use client';

import type { Question } from '@orbi/shared';
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
import { DeleteQuestionDialog } from './delete-question-dialog';

type QuestionActionsProps = {
	courseId: string;
	question: Question;
	onEdit: () => void;
	// the editor takes the focus; it comes back here afterwards
	triggerRef: Ref<HTMLButtonElement>;
};

export function QuestionActions({
	courseId,
	question,
	onEdit,
	triggerRef,
}: QuestionActionsProps) {
	const [deleting, setDeleting] = useState(false);
	// the menu would move the focus back to its button after Edit, away from the editor
	const editPicked = useRef(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						ref={triggerRef}
						variant="ghost"
						size="icon-sm"
						aria-label="Question actions"
						className="-my-1 shrink-0 rounded-md text-muted-foreground"
					>
						<Ellipsis />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					className="w-44"
					onCloseAutoFocus={(event) => {
						if (!editPicked.current) return;
						editPicked.current = false;
						event.preventDefault();
					}}
				>
					<DropdownMenuItem
						onSelect={() => {
							editPicked.current = true;
							onEdit();
						}}
					>
						<Pencil />
						Edit question
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						variant="destructive"
						onSelect={() => setDeleting(true)}
					>
						<Trash2 />
						Delete question
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<DeleteQuestionDialog
				courseId={courseId}
				question={question}
				open={deleting}
				onOpenChange={setDeleting}
			/>
		</>
	);
}

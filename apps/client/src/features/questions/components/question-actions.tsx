'use client';

import type { Question } from '@orbi/shared';
import { Ellipsis, Flag, Pencil, Trash2 } from 'lucide-react';
import { useRef, useState, type Ref } from 'react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDropReportedQuestion } from '../topic-hooks';
import { DeleteQuestionDialog } from './delete-question-dialog';
import { ReportQuestionDialog } from './report-question-dialog';

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
	const [dialog, setDialog] = useState<'report' | 'delete' | null>(null);
	const dropReported = useDropReportedQuestion(courseId, question.topicId);
	const openOnly = (name: 'report' | 'delete') => (open: boolean) =>
		setDialog(open ? name : null);
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
					<DropdownMenuItem onSelect={() => setDialog('report')}>
						<Flag />
						Report question
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						variant="destructive"
						onSelect={() => setDialog('delete')}
					>
						<Trash2 />
						Delete question
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<ReportQuestionDialog
				questionId={question.id}
				open={dialog === 'report'}
				onOpenChange={openOnly('report')}
				onReported={() => dropReported(question.id)}
			/>
			<DeleteQuestionDialog
				courseId={courseId}
				question={question}
				open={dialog === 'delete'}
				onOpenChange={openOnly('delete')}
			/>
		</>
	);
}

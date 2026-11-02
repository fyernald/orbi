'use client';

import type { Question } from '@orbi/shared';
import { Flag } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ReportQuestionDialog } from './report-question-dialog';

type ReportQuestionButtonProps = {
	questionId: string;
	onReported: (rejected: Question) => void;
	// a study session turns its answer keys off while the dialog is open
	onOpenChange?: (open: boolean) => void;
	disabled?: boolean;
	className?: string;
};

// a quiet flag, like Duolingo's "Report", that opens the report dialog
export function ReportQuestionButton({
	questionId,
	onReported,
	onOpenChange,
	disabled = false,
	className,
}: ReportQuestionButtonProps) {
	const [open, setOpen] = useState(false);
	const changeOpen = (next: boolean) => {
		setOpen(next);
		onOpenChange?.(next);
	};

	return (
		<>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={() => changeOpen(true)}
				disabled={disabled}
				className={cn('rounded-full text-muted-foreground', className)}
			>
				<Flag />
				Report
			</Button>
			<ReportQuestionDialog
				questionId={questionId}
				open={open}
				onOpenChange={changeOpen}
				onReported={onReported}
			/>
		</>
	);
}

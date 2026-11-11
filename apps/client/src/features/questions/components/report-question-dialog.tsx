'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
	REPORT_COMMENT_MAX_LENGTH,
	reportQuestionInput,
	type Question,
	type ReportQuestionInput,
} from '@orbi/shared';
import { useForm, useWatch } from 'react-hook-form';
import { FormError } from '@/components/form/form-error';
import { TextareaField } from '@/components/form/textarea-field';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { apiErrorMessage } from '@/lib/api';
import { useReportQuestion } from '../hooks';
import { ReportReasonOptions } from './report-reason-options';

type ReportQuestionDialogProps = {
	questionId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onReported: (rejected: Question) => void;
};

// a reason to pick and an optional comment; it stays open while sending, so a
// failure can be shown and tried again
export function ReportQuestionDialog({
	questionId,
	open,
	onOpenChange,
	onReported,
}: ReportQuestionDialogProps) {
	const report = useReportQuestion();
	const form = useForm<ReportQuestionInput>({
		resolver: zodResolver(reportQuestionInput),
		defaultValues: { comment: '' },
	});
	const reason = useWatch({ control: form.control, name: 'reason' });
	const sending = report.isPending || form.formState.isSubmitting;

	const close = () => {
		onOpenChange(false);
		form.reset();
		report.reset();
	};

	const send = form.handleSubmit((values) =>
		report.mutate(
			{ id: questionId, ...values },
			{
				onSuccess: (rejected) => {
					close();
					onReported(rejected);
				},
			}
		)
	);

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (sending) return;
				if (next) onOpenChange(true);
				else close();
			}}
		>
			<DialogContent className="sm:max-w-md">
				<form
					method="post"
					onSubmit={send}
					noValidate
					className="flex flex-col gap-5"
				>
					<DialogHeader>
						<DialogTitle>Report this question</DialogTitle>
						<DialogDescription>
							It is taken out of your study questions. Reports help the team see
							where Orbi&apos;s questions go wrong.
						</DialogDescription>
					</DialogHeader>
					<ReportReasonOptions form={form} />
					<TextareaField
						control={form.control}
						name="comment"
						label={reason === 'other' ? 'Comment' : 'Comment (optional)'}
						rows={2}
						maxLength={REPORT_COMMENT_MAX_LENGTH}
						placeholder="What should the question or answer be?"
						className="field-sizing-content max-h-32 min-h-16 resize-none"
					/>
					<FormError message={apiErrorMessage(report.error)} />
					<DialogFooter>
						<DialogClose asChild>
							<Button
								type="button"
								variant="outline"
								disabled={sending}
								className="rounded-full"
							>
								Cancel
							</Button>
						</DialogClose>
						<Button type="submit" disabled={sending} className="rounded-full">
							{report.isPending && <Spinner />}
							Send report
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

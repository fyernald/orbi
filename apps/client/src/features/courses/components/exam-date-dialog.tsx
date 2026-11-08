'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { examDateInput, type Course, type ExamDateInput } from '@orbi/shared';
import { useForm } from 'react-hook-form';
import { FormError } from '@/components/form/form-error';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { apiErrorMessage } from '@/lib/api';
import { useUpdateCourse } from '../hooks';
import { ExamDateField } from './exam-date-field';

type ExamDateDialogProps = {
	course: Course;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

// stays open while saving, so a failure can be shown and tried again
export function ExamDateDialog({
	course,
	open,
	onOpenChange,
}: ExamDateDialogProps) {
	const update = useUpdateCourse(course.id);
	const close = (next: boolean) => {
		if (update.isPending) return;
		onOpenChange(next);
		if (!next) update.reset();
	};

	return (
		<Dialog open={open} onOpenChange={close}>
			<DialogContent aria-describedby={undefined} className="gap-5">
				<DialogHeader>
					<DialogTitle>Exam date</DialogTitle>
				</DialogHeader>
				{/* mounted only while open, so each opening starts from the saved date */}
				<ExamDateForm
					examDate={course.examDate}
					pending={update.isPending}
					error={apiErrorMessage(update.error)}
					onSave={(values) =>
						update.mutate(values, { onSuccess: () => onOpenChange(false) })
					}
				/>
			</DialogContent>
		</Dialog>
	);
}

type ExamDateFormProps = {
	examDate: string | null;
	pending: boolean;
	error?: string;
	onSave: (values: ExamDateInput) => void;
};

function ExamDateForm({ examDate, pending, error, onSave }: ExamDateFormProps) {
	const form = useForm<ExamDateInput>({
		resolver: zodResolver(examDateInput),
		defaultValues: { examDate },
	});

	return (
		<form
			method="post"
			onSubmit={form.handleSubmit(onSave)}
			noValidate
			className="flex flex-col gap-4"
		>
			<ExamDateField control={form.control} />
			<FormError message={error} />
			<DialogFooter>
				<DialogClose asChild>
					<Button
						variant="outline"
						disabled={pending}
						className="h-10 rounded-full px-4"
					>
						Cancel
					</Button>
				</DialogClose>
				<Button
					type="submit"
					disabled={pending}
					className="h-10 rounded-full px-4"
				>
					{pending && <Spinner />}
					Save
				</Button>
			</DialogFooter>
		</form>
	);
}

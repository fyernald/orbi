'use client';

import { useId } from 'react';
import { useController, type Control, type Path } from 'react-hook-form';
import { DatePicker } from '@/components/date-picker';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field';
import { toIsoDate } from '@/lib/dates';
import { examCountdown } from '../exam-date';

type ExamDateValues = { examDate?: string | null };

// in the new course form and the exam date dialog
export function ExamDateField<TValues extends ExamDateValues>({
	control,
}: {
	control: Control<TValues>;
}) {
	const { field, fieldState } = useController({
		control,
		name: 'examDate' as Path<TValues>,
	});
	const value = field.value as string | null | undefined;
	const id = useId();
	const descriptionId = `${id}-description`;
	const now = new Date();

	return (
		<Field data-invalid={fieldState.invalid} className="max-w-xs">
			<FieldLabel htmlFor={id}>Exam date</FieldLabel>
			<DatePicker
				id={id}
				buttonRef={field.ref}
				value={value ?? null}
				onChange={field.onChange}
				min={toIsoDate(now)}
				placeholder="Pick the exam day"
				invalid={fieldState.invalid}
				aria-describedby={descriptionId}
			/>
			<FieldDescription id={descriptionId}>
				{value
					? examCountdown(value, now)
					: 'Leave it empty if you do not know it yet.'}
			</FieldDescription>
			<FieldError errors={[fieldState.error]} />
		</Field>
	);
}

'use client';

import type { CreateCourseInput } from '@orbi/shared';
import { useId } from 'react';
import { useController, type Control } from 'react-hook-form';
import { DatePicker } from '@/components/date-picker';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field';
import { toIsoDate } from '@/lib/dates';
import { examCountdown } from '../exam-date';

export function ExamDateField({
	control,
}: {
	control: Control<CreateCourseInput>;
}) {
	const { field, fieldState } = useController({ control, name: 'examDate' });
	const id = useId();
	const descriptionId = `${id}-description`;
	const now = new Date();

	return (
		<Field data-invalid={fieldState.invalid} className="max-w-xs">
			<FieldLabel htmlFor={id}>Exam date</FieldLabel>
			<DatePicker
				id={id}
				buttonRef={field.ref}
				value={field.value ?? null}
				onChange={field.onChange}
				min={toIsoDate(now)}
				placeholder="Pick the exam day"
				invalid={fieldState.invalid}
				aria-describedby={descriptionId}
			/>
			<FieldDescription id={descriptionId}>
				{field.value
					? examCountdown(field.value, now)
					: 'Leave it empty if you do not know it yet.'}
			</FieldDescription>
			<FieldError errors={[fieldState.error]} />
		</Field>
	);
}

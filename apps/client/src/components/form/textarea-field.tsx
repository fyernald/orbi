'use client';

import { useId, type ComponentProps } from 'react';
import {
	useController,
	type Control,
	type FieldValues,
	type Path,
} from 'react-hook-form';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

type TextareaFieldProps<TValues extends FieldValues> = {
	control: Control<TValues>;
	name: Path<TValues>;
	label: string;
	description?: string;
} & Omit<ComponentProps<typeof Textarea>, 'name' | 'id'>;

// a labelled multi-line input bound to a react-hook-form field, with its error below
export function TextareaField<TValues extends FieldValues>({
	control,
	name,
	label,
	description,
	...textareaProps
}: TextareaFieldProps<TValues>) {
	const { field, fieldState } = useController({ control, name });
	const id = useId();
	const descriptionId = `${id}-description`;
	const errorId = `${id}-error`;
	const invalid = fieldState.error !== undefined;

	return (
		<Field data-invalid={invalid}>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			<Textarea
				{...textareaProps}
				{...field}
				value={field.value ?? ''}
				id={id}
				aria-invalid={invalid}
				aria-describedby={invalid ? errorId : description && descriptionId}
			/>
			{description && !invalid && (
				<FieldDescription id={descriptionId}>{description}</FieldDescription>
			)}
			<FieldError id={errorId} errors={[fieldState.error]} />
		</Field>
	);
}

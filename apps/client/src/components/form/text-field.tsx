'use client';

import { useId, type ComponentProps } from 'react';
import {
	useController,
	type Control,
	type FieldValues,
	type Path,
} from 'react-hook-form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

type TextFieldProps<TValues extends FieldValues> = {
	control: Control<TValues>;
	name: Path<TValues>;
	label: string;
} & Omit<ComponentProps<typeof Input>, 'name' | 'id'>;

// a labelled input bound to a react-hook-form field, with its error below
export function TextField<TValues extends FieldValues>({
	control,
	name,
	label,
	...inputProps
}: TextFieldProps<TValues>) {
	const { field, fieldState } = useController({ control, name });
	const id = useId();
	const errorId = `${id}-error`;
	const invalid = fieldState.error !== undefined;

	return (
		<Field data-invalid={invalid}>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			<Input
				{...inputProps}
				{...field}
				id={id}
				aria-invalid={invalid}
				aria-describedby={invalid ? errorId : undefined}
			/>
			<FieldError id={errorId} errors={[fieldState.error]} />
		</Field>
	);
}

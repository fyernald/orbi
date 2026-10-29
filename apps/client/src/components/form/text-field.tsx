'use client';

import { useId, type ComponentProps, type ReactNode } from 'react';
import {
	useController,
	type Control,
	type FieldValues,
	type Path,
} from 'react-hook-form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type TextFieldProps<TValues extends FieldValues> = {
	control: Control<TValues>;
	name: Path<TValues>;
	label: string;
	// only for screen readers, when the form around it already says what to type
	hideLabel?: boolean;
	// a small button inside the input, on the right
	action?: ReactNode;
} & Omit<ComponentProps<typeof Input>, 'name' | 'id'>;

// a labelled input bound to a react-hook-form field, with its error below
export function TextField<TValues extends FieldValues>({
	control,
	name,
	label,
	hideLabel = false,
	action,
	className,
	...inputProps
}: TextFieldProps<TValues>) {
	const { field, fieldState } = useController({ control, name });
	const id = useId();
	const errorId = `${id}-error`;
	const invalid = fieldState.error !== undefined;

	return (
		<Field data-invalid={invalid}>
			<FieldLabel htmlFor={id} className={cn(hideLabel && 'sr-only')}>
				{label}
			</FieldLabel>
			<div className="relative">
				<Input
					{...inputProps}
					{...field}
					id={id}
					aria-invalid={invalid}
					aria-describedby={invalid ? errorId : undefined}
					className={cn(action && 'pr-9', className)}
				/>
				{action && (
					<div className="absolute inset-y-0 right-0 flex items-center pr-0.5">
						{action}
					</div>
				)}
			</div>
			<FieldError id={errorId} errors={[fieldState.error]} />
		</Field>
	);
}

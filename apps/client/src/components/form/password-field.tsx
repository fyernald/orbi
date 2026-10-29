'use client';

import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useState } from 'react';
import type { FieldValues } from 'react-hook-form';
import { TextField, type TextFieldProps } from './text-field';

type PasswordFieldProps<TValues extends FieldValues> = Omit<
	TextFieldProps<TValues>,
	'type' | 'action'
>;

// a password input with a button to show what was typed, so typos are easy to spot
export function PasswordField<TValues extends FieldValues>(
	props: PasswordFieldProps<TValues>
) {
	const [visible, setVisible] = useState(false);
	const Icon = visible ? EyeOffIcon : EyeIcon;

	return (
		<TextField
			{...props}
			type={visible ? 'text' : 'password'}
			action={
				<button
					type="button"
					onClick={() => setVisible((value) => !value)}
					aria-label={visible ? 'Hide password' : 'Show password'}
					aria-pressed={visible}
					className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
				>
					<Icon className="size-4" />
				</button>
			}
		/>
	);
}

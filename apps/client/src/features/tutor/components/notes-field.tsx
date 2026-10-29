'use client';

import type { TutorRequestInput } from '@orbi/shared';
import type { KeyboardEvent } from 'react';
import { useController, type Control } from 'react-hook-form';

type NotesFieldProps = {
	control: Control<TutorRequestInput>;
	label: string;
	placeholder: string;
	// chat style: Enter sends, Shift+Enter starts a new line
	sendOnEnter: boolean;
};

export function NotesField({
	control,
	label,
	placeholder,
	sendOnEnter,
}: NotesFieldProps) {
	const { field } = useController({ control, name: 'message' });

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		// isComposing: Enter also confirms a word in IME keyboards (for example Japanese)
		if (
			!sendOnEnter ||
			event.key !== 'Enter' ||
			event.shiftKey ||
			event.nativeEvent.isComposing
		) {
			return;
		}
		event.preventDefault();
		event.currentTarget.form?.requestSubmit();
	};

	return (
		<>
			<label htmlFor="home-notes" className="sr-only">
				{label}
			</label>
			<textarea
				{...field}
				id="home-notes"
				rows={3}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				className="field-sizing-content block max-h-64 min-h-20 w-full resize-none bg-transparent px-3 pt-3.5 pb-1.5 text-base leading-relaxed outline-none placeholder:text-muted-foreground"
			/>
		</>
	);
}

'use client';

import type { TutorRequestInput } from '@orbi/shared';
import { useId, type KeyboardEvent } from 'react';
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
	// several chats can be on the page at once, each with its own field
	const id = useId();

	// Ctrl+Enter (Cmd+Enter on a Mac) sends in every action, like the notes form
	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		// isComposing: Enter also confirms a word in IME keyboards (for example Japanese)
		if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
		const shortcut = event.ctrlKey || event.metaKey;
		if (!shortcut && (!sendOnEnter || event.shiftKey)) return;
		event.preventDefault();
		event.currentTarget.form?.requestSubmit();
	};

	return (
		<>
			<label htmlFor={id} className="sr-only">
				{label}
			</label>
			<textarea
				{...field}
				id={id}
				rows={3}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				className="field-sizing-content block max-h-64 min-h-20 w-full resize-none bg-transparent px-3 pt-3.5 pb-1.5 text-base leading-relaxed outline-none placeholder:text-muted-foreground"
			/>
		</>
	);
}

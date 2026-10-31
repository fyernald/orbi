'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
	createNoteInput,
	NOTE_CONTENT_MAX_LENGTH,
	type CreateNoteInput,
} from '@orbi/shared';
import { useId, type KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { FormError } from '@/components/form/form-error';
import { KeyHint } from '@/components/key-hint';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { apiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useCreateNote } from '../hooks';

type NoteFormProps = {
	courseId: string;
	topicId: string;
};

// one card like a page: an optional title, then the pasted notes; it clears after
// each save, so several notes can be added in a row
export function NoteForm({ courseId, topicId }: NoteFormProps) {
	const create = useCreateNote(courseId, topicId);
	const id = useId();
	const form = useForm<CreateNoteInput>({
		resolver: zodResolver(createNoteInput),
		defaultValues: { title: '', content: '' },
	});
	const contentError = form.formState.errors.content?.message;
	const titleError = form.formState.errors.title?.message;
	const length = form.watch('content').length;
	const saving = create.isPending || form.formState.isSubmitting;

	const save = form.handleSubmit((values) =>
		create.mutate(values, {
			onSuccess: () => {
				form.reset();
				form.setFocus('content');
			},
		})
	);

	// Ctrl+Enter (Cmd+Enter on a Mac) saves; plain Enter starts a new line. Like
	// the disabled button, it does nothing while a save is running, so a second
	// press cannot save the same note twice
	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			if (saving) return;
			void save();
		}
	};

	return (
		<form onSubmit={save} noValidate className="flex flex-col gap-2">
			<div
				className={cn(
					'flex flex-col rounded-xl border border-input transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30',
					contentError &&
						'border-destructive ring-3 ring-destructive/20 focus-within:border-destructive focus-within:ring-destructive/20'
				)}
			>
				<label htmlFor={`${id}-title`} className="sr-only">
					Note title (optional)
				</label>
				<input
					{...form.register('title')}
					id={`${id}-title`}
					autoComplete="off"
					placeholder="Title (optional)"
					aria-invalid={titleError ? true : undefined}
					aria-describedby={titleError ? `${id}-title-error` : undefined}
					className="h-11 bg-transparent px-3.5 text-base font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground md:text-sm"
				/>
				<label htmlFor={`${id}-content`} className="sr-only">
					Notes
				</label>
				<textarea
					{...form.register('content')}
					id={`${id}-content`}
					rows={6}
					onKeyDown={handleKeyDown}
					placeholder="Paste or type your notes for this topic"
					aria-invalid={contentError ? true : undefined}
					aria-describedby={`${id}-hint`}
					className="field-sizing-content block max-h-80 min-h-36 w-full resize-none border-t border-divider bg-transparent px-3.5 py-3 text-base leading-relaxed outline-none placeholder:text-muted-foreground md:text-sm"
				/>
				<div className="flex items-center justify-between gap-3 border-t border-divider py-2 pr-2 pl-3.5">
					<p
						id={`${id}-hint`}
						className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground"
					>
						{contentError ? (
							<span role="alert" className="text-destructive">
								{contentError}
							</span>
						) : (
							<>
								<KeyHint>Ctrl</KeyHint>
								<KeyHint>Enter</KeyHint>
								<span className="ml-0.5">save</span>
								<span aria-hidden className="mx-1.5">
									·
								</span>
								<span className="tabular-nums">
									{length.toLocaleString('en')} /{' '}
									{NOTE_CONTENT_MAX_LENGTH.toLocaleString('en')}
								</span>
							</>
						)}
					</p>
					<Button
						type="submit"
						disabled={saving}
						className="h-8 shrink-0 rounded-lg px-3"
					>
						{create.isPending && <Spinner />}
						Save note
					</Button>
				</div>
			</div>
			{titleError && (
				<p id={`${id}-title-error`} className="px-1 text-xs text-destructive">
					{titleError}
				</p>
			)}
			<FormError message={apiErrorMessage(create.error)} />
		</form>
	);
}

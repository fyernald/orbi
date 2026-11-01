'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createTopicInput, type CreateTopicInput } from '@orbi/shared';
import { useEffect, useId } from 'react';
import { useForm } from 'react-hook-form';
import { KeyHint } from '@/components/key-hint';
import { Spinner } from '@/components/ui/spinner';
import { apiErrorMessage } from '@/lib/api';
import { useCreateTopic } from '../hooks';

type AddTopicInlineProps = {
	courseId: string;
	// a new value moves focus to the name again, when another pane asks to add a
	// topic while this field is already open
	focusRequest?: number;
	onClose: () => void;
};

// stays open after each topic, so several can be added in a row; Esc closes it
export function AddTopicInline({
	courseId,
	focusRequest,
	onClose,
}: AddTopicInlineProps) {
	const create = useCreateTopic(courseId);
	const hintId = useId();
	const form = useForm<CreateTopicInput>({
		resolver: zodResolver(createTopicInput),
		defaultValues: { name: '' },
	});
	useEffect(() => {
		form.setFocus('name');
	}, [focusRequest, form]);
	const message =
		form.formState.errors.name?.message ?? apiErrorMessage(create.error);

	return (
		<form
			onSubmit={form.handleSubmit((values) =>
				create.mutate(values, {
					onSuccess: () => {
						form.reset();
						form.setFocus('name');
					},
				})
			)}
			noValidate
			className="flex flex-col gap-1.5"
		>
			<div className="relative">
				<input
					{...form.register('name')}
					autoFocus
					autoComplete="off"
					placeholder="New topic name"
					aria-label="New topic name"
					aria-invalid={message ? true : undefined}
					aria-describedby={hintId}
					onKeyDown={(event) => {
						if (event.key === 'Escape') onClose();
					}}
					className="h-9 w-full rounded-md border border-ring bg-transparent pr-8 pl-2.5 text-base ring-3 ring-ring/30 outline-none placeholder:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm"
				/>
				{create.isPending && (
					<Spinner className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground" />
				)}
			</div>
			<p
				id={hintId}
				className="flex flex-wrap items-center gap-x-3 gap-y-1 px-0.5 text-xs text-muted-foreground"
			>
				{message ? (
					<span className="text-destructive">{message}</span>
				) : (
					<>
						<span className="flex items-center gap-1">
							<KeyHint>Enter</KeyHint> add
						</span>
						<span className="flex items-center gap-1">
							<KeyHint>Esc</KeyHint> close
						</span>
					</>
				)}
			</p>
		</form>
	);
}

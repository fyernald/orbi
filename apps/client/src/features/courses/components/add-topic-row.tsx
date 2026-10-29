'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createTopicInput, type CreateTopicInput } from '@orbi/shared';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { apiErrorMessage } from '@/lib/api';
import { useCreateTopic } from '../hooks';
import { KeyHint } from './key-hint';

type AddTopicRowProps = {
	courseId: string;
	onClose: () => void;
};

// stays open after each topic, so several can be added in a row; Esc closes it
export function AddTopicRow({ courseId, onClose }: AddTopicRowProps) {
	const create = useCreateTopic(courseId);
	const form = useForm<CreateTopicInput>({
		resolver: zodResolver(createTopicInput),
		defaultValues: { name: '' },
	});
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
			className="flex flex-col gap-2 border-t border-divider bg-muted/30 px-5 py-4"
		>
			<div className="flex items-center gap-4">
				<span
					aria-hidden="true"
					className="flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground"
				>
					<Plus className="size-4" />
				</span>
				<input
					{...form.register('name')}
					autoFocus
					autoComplete="off"
					placeholder="Topic name, for example Cell division"
					aria-label="Topic name"
					aria-invalid={message ? true : undefined}
					aria-describedby="add-topic-message"
					onKeyDown={(event) => {
						if (event.key === 'Escape') onClose();
					}}
					className="h-10 min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground md:text-sm"
				/>
				<Button
					type="submit"
					disabled={create.isPending}
					className="h-9 rounded-full px-4"
				>
					{create.isPending && <Spinner />}
					Add
				</Button>
			</div>
			<p
				id="add-topic-message"
				className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-14 text-xs text-muted-foreground"
			>
				{message ? (
					<span className="text-destructive">{message}</span>
				) : (
					<>
						<span className="flex items-center gap-1.5">
							<KeyHint>Enter</KeyHint> to add
						</span>
						<span className="flex items-center gap-1.5">
							<KeyHint>Esc</KeyHint> to close
						</span>
					</>
				)}
			</p>
		</form>
	);
}

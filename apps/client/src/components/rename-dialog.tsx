'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { FormError } from '@/components/form/form-error';
import { TextField } from '@/components/form/text-field';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';

type NameInput = { name: string };

type RenameDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	label: string;
	name: string;
	schema: z.ZodType<NameInput, NameInput>;
	pending: boolean;
	error?: string;
	onSave: (name: string) => void;
};

// stays open while saving, so a failure can be shown and tried again
export function RenameDialog({
	open,
	onOpenChange,
	title,
	pending,
	...form
}: RenameDialogProps) {
	return (
		<Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
			<DialogContent aria-describedby={undefined} className="gap-5">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				{/* mounted only while open, so each opening starts from the saved name */}
				<RenameForm
					{...form}
					pending={pending}
					onClose={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}

type RenameFormProps = Pick<
	RenameDialogProps,
	'label' | 'name' | 'schema' | 'pending' | 'error' | 'onSave'
> & { onClose: () => void };

function RenameForm({
	label,
	name,
	schema,
	pending,
	error,
	onSave,
	onClose,
}: RenameFormProps) {
	const form = useForm<NameInput>({
		resolver: zodResolver(schema),
		defaultValues: { name },
	});

	return (
		<form
			onSubmit={form.handleSubmit((values) =>
				values.name === name ? onClose() : onSave(values.name)
			)}
			noValidate
			className="flex flex-col gap-4"
		>
			<TextField
				control={form.control}
				name="name"
				label={label}
				autoComplete="off"
				onFocus={(event) => event.currentTarget.select()}
				className="h-10"
			/>
			<FormError message={error} />
			<DialogFooter>
				<DialogClose asChild>
					<Button
						variant="outline"
						disabled={pending}
						className="h-10 rounded-full px-4"
					>
						Cancel
					</Button>
				</DialogClose>
				<Button
					type="submit"
					disabled={pending}
					className="h-10 rounded-full px-4"
				>
					{pending && <Spinner />}
					Save
				</Button>
			</DialogFooter>
		</form>
	);
}

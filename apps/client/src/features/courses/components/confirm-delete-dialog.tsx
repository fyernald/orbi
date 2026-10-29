'use client';

import { Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { FormError } from '@/components/form/form-error';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type ConfirmDeleteDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: ReactNode;
	confirmLabel: string;
	pending: boolean;
	error?: string;
	onConfirm: () => void;
};

// stays open while deleting, so a failure can be shown and tried again
export function ConfirmDeleteDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	pending,
	error,
	onConfirm,
}: ConfirmDeleteDialogProps) {
	return (
		<AlertDialog
			open={open}
			onOpenChange={(next) => !pending && onOpenChange(next)}
		>
			<AlertDialogContent>
				<AlertDialogHeader className="flex-row items-start gap-4">
					<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
						<Trash2 className="size-5" />
					</span>
					<div className="flex flex-col gap-1.5">
						<AlertDialogTitle>{title}</AlertDialogTitle>
						<AlertDialogDescription>{description}</AlertDialogDescription>
					</div>
				</AlertDialogHeader>
				<FormError message={error} />
				<AlertDialogFooter>
					<AlertDialogCancel
						disabled={pending}
						className="h-10 rounded-full px-4"
					>
						Cancel
					</AlertDialogCancel>
					<Button
						onClick={onConfirm}
						disabled={pending}
						className="h-10 rounded-full bg-destructive px-4 text-white hover:bg-destructive/90"
					>
						{pending && <Spinner />}
						{confirmLabel}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

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
	// what else is deleted with it, listed under the description
	consequences?: string[];
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
	consequences = [],
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
						{consequences.length > 0 && (
							<ul
								aria-label="Also deleted"
								className="mt-1 flex flex-col gap-1 text-sm"
							>
								{consequences.map((item) => (
									<li key={item} className="flex items-center gap-2">
										<span
											aria-hidden
											className="size-1.5 shrink-0 rounded-full bg-destructive/70"
										/>
										{item}
									</li>
								))}
							</ul>
						)}
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
						className="h-10 rounded-full bg-destructive px-4 text-destructive-foreground hover:bg-destructive/90"
					>
						{pending && <Spinner />}
						{confirmLabel}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

'use client';

import type { ReportQuestionInput } from '@orbi/shared';
import { useId } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { reportReasons } from '../report-reasons';

type ReportReasonOptionsProps = {
	form: UseFormReturn<ReportQuestionInput>;
};

// one card per reason, so the whole card picks it
export function ReportReasonOptions({ form }: ReportReasonOptionsProps) {
	const id = useId();
	const error = form.formState.errors.reason?.message;

	return (
		<fieldset
			aria-describedby={error ? `${id}-error` : undefined}
			className="flex min-w-0 flex-col gap-1.5"
		>
			<legend className="mb-2 text-sm font-medium">What is wrong?</legend>
			{reportReasons.map(({ value, label, hint }) => (
				<label
					key={value}
					className={cn(
						'flex cursor-pointer items-start gap-3 rounded-lg border border-input px-3 py-2.5 transition-colors hover:bg-muted/60 has-checked:border-primary has-checked:bg-accent/40 has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
						error && 'border-destructive'
					)}
				>
					<input
						{...form.register('reason')}
						type="radio"
						value={value}
						aria-describedby={`${id}-${value}-hint`}
						className="mt-0.5 size-4 shrink-0 accent-primary outline-none"
					/>
					<span className="flex min-w-0 flex-col gap-0.5">
						<span className="text-sm font-medium">{label}</span>
						<span
							id={`${id}-${value}-hint`}
							className="text-xs text-muted-foreground"
						>
							{hint}
						</span>
					</span>
				</label>
			))}
			{error && (
				<p
					id={`${id}-error`}
					role="alert"
					className="px-1 text-xs text-destructive"
				>
					{error}
				</p>
			)}
		</fieldset>
	);
}

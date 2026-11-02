'use client';

import {
	EXPLANATION_MAX_LENGTH,
	QUESTION_TEXT_MAX_LENGTH,
	type QuestionInput,
} from '@orbi/shared';
import { useEffect, type KeyboardEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { FormError } from '@/components/form/form-error';
import { TextareaField } from '@/components/form/textarea-field';
import { KeyHint } from '@/components/key-hint';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { QuestionFormValues } from '../question-form';
import { ChoiceFields } from './choice-fields';

type QuestionEditorProps = {
	form: UseFormReturn<QuestionFormValues, unknown, QuestionInput>;
	onSave: (values: QuestionInput) => void;
	onCancel: () => void;
	pending: boolean;
	error?: string;
	saveLabel: string;
};

// the question, its options with the correct one marked, and an optional explanation
export function QuestionEditor({
	form,
	onSave,
	onCancel,
	pending,
	error,
	saveLabel,
}: QuestionEditorProps) {
	const saving = pending || form.formState.isSubmitting;
	const save = form.handleSubmit(onSave);

	useEffect(() => {
		form.setFocus('text');
	}, [form]);

	// Ctrl+Enter (Cmd+Enter on a Mac) saves from any field, and does nothing while a
	// save is running; Esc stops writing
	const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
		if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			if (!saving) void save();
		}
		if (event.key === 'Escape' && !saving) onCancel();
	};

	return (
		<form
			onSubmit={save}
			onKeyDown={handleKeyDown}
			noValidate
			// the sheet leaves Esc to the editor, so it stops writing without closing
			data-question-editor
			className="flex flex-col gap-4 rounded-xl border border-border p-4"
		>
			<TextareaField
				control={form.control}
				name="text"
				label="Question"
				rows={2}
				maxLength={QUESTION_TEXT_MAX_LENGTH}
				placeholder="What do you want to be asked?"
				className="field-sizing-content max-h-48 min-h-16 resize-none"
			/>
			<ChoiceFields form={form} />
			<TextareaField
				control={form.control}
				name="explanation"
				label="Explanation (optional)"
				description="Shown after you answer, to say why the correct option is right."
				rows={2}
				maxLength={EXPLANATION_MAX_LENGTH}
				className="field-sizing-content max-h-40 min-h-16 resize-none"
			/>
			<FormError message={error} />
			<div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-divider pt-3">
				{/* a touch screen has no Ctrl key */}
				<p className="hidden items-center gap-1 text-xs text-muted-foreground pointer-fine:flex">
					<KeyHint>Ctrl</KeyHint>
					<KeyHint>Enter</KeyHint>
					<span className="ml-0.5">save</span>
				</p>
				<div className="ml-auto flex items-center gap-1.5">
					<Button
						type="button"
						variant="ghost"
						onClick={onCancel}
						disabled={saving}
						className="h-8 rounded-lg px-3"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={saving}
						className="h-8 rounded-lg px-3"
					>
						{pending && <Spinner />}
						{saveLabel}
					</Button>
				</div>
			</div>
		</form>
	);
}

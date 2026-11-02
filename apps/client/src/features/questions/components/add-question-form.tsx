'use client';

import { Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { apiErrorMessage } from '@/lib/api';
import { emptyQuestion } from '../question-form';
import { useAddQuestion } from '../topic-hooks';
import { useQuestionForm } from '../use-question-form';
import { QuestionEditor } from './question-editor';

type AddQuestionFormProps = {
	courseId: string;
	topicId: string;
};

// closed until the student starts writing; it clears after each save and stays
// open, so several questions can be added in a row
export function AddQuestionForm({ courseId, topicId }: AddQuestionFormProps) {
	const [open, setOpen] = useState(false);
	const add = useAddQuestion(courseId, topicId);
	const form = useQuestionForm();
	const openButton = useRef<HTMLButtonElement>(null);

	const close = () => {
		form.reset(emptyQuestion());
		add.reset();
		setOpen(false);
		requestAnimationFrame(() => openButton.current?.focus());
	};

	if (!open) {
		return (
			<button
				ref={openButton}
				type="button"
				onClick={() => setOpen(true)}
				className="flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-left transition-colors hover:border-primary hover:bg-accent/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
			>
				<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
					<Plus className="size-4" />
				</span>
				<span className="flex flex-col">
					<span className="text-sm font-medium">Write a question</span>
					<span className="text-xs text-muted-foreground">
						Practise what Orbi missed. It is ready to study right away.
					</span>
				</span>
			</button>
		);
	}

	return (
		<QuestionEditor
			form={form}
			onSave={(values) =>
				add.mutate(values, {
					onSuccess: () => {
						form.reset(emptyQuestion());
						form.setFocus('text');
					},
				})
			}
			onCancel={close}
			pending={add.isPending}
			error={apiErrorMessage(add.error)}
			saveLabel="Add question"
		/>
	);
}

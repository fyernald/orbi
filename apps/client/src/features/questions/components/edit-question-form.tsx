'use client';

import type { Question } from '@orbi/shared';
import { apiErrorMessage } from '@/lib/api';
import { useUpdateQuestion } from '../topic-hooks';
import { useQuestionForm } from '../use-question-form';
import { QuestionEditor } from './question-editor';

type EditQuestionFormProps = {
	courseId: string;
	question: Question;
	// after a save or a cancel
	onDone: () => void;
};

// the saved question in the same editor as a new one
export function EditQuestionForm({
	courseId,
	question,
	onDone,
}: EditQuestionFormProps) {
	const update = useUpdateQuestion(courseId, question.topicId);
	const form = useQuestionForm(question);

	return (
		<QuestionEditor
			form={form}
			onSave={(values) =>
				update.mutate({ id: question.id, ...values }, { onSuccess: onDone })
			}
			onCancel={onDone}
			pending={update.isPending}
			error={apiErrorMessage(update.error)}
			saveLabel="Save changes"
		/>
	);
}

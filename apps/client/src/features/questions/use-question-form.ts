'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { questionInput, type Question, type QuestionInput } from '@orbi/shared';
import { useForm, type Resolver } from 'react-hook-form';
import {
	emptyQuestion,
	toQuestionValues,
	type QuestionFormValues,
} from './question-form';

// the schema expects a marked option; the form may hold none until the student picks one
const resolver = zodResolver(questionInput) as unknown as Resolver<
	QuestionFormValues,
	unknown,
	QuestionInput
>;

// a new question, or the saved one to edit
export function useQuestionForm(saved?: Question) {
	return useForm<QuestionFormValues, unknown, QuestionInput>({
		resolver,
		defaultValues: saved ? toQuestionValues(saved) : emptyQuestion(),
	});
}

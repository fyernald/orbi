'use client';

import { question, type Question, type QuestionInput } from '@orbi/shared';
import {
	useMutation,
	useQuery,
	useQueryClient,
	type QueryClient,
} from '@tanstack/react-query';
import { z } from 'zod';
import { topicsKey } from '@/features/courses/query-keys';
import { api } from '@/lib/api';
import { reviewKey } from './hooks';

// the questions of a topic live under the topic, like its notes
export const topicQuestionsKey = (courseId: string, topicId: string) =>
	[...topicsKey(courseId), topicId, 'questions'] as const;

const questionsPath = (courseId: string, topicId: string) =>
	`/courses/${courseId}/topics/${topicId}/questions`;

// The tutor adds questions and the review page approves them, so the list loads
// again every time it opens
export function useTopicQuestions(courseId: string, topicId: string) {
	return useQuery({
		queryKey: topicQuestionsKey(courseId, topicId),
		queryFn: () => api.get(questionsPath(courseId, topicId), z.array(question)),
		staleTime: 0,
	});
}

// Changes the topic's list at once. A question waiting for review is also in the
// review list, so that loads again; a study session loads fresh each time it opens
function updateTopicQuestions(
	queryClient: QueryClient,
	courseId: string,
	topicId: string,
	change: (questions: Question[]) => Question[]
) {
	queryClient.setQueryData<Question[]>(
		topicQuestionsKey(courseId, topicId),
		(questions) => questions && change(questions)
	);
	void queryClient.invalidateQueries({ queryKey: reviewKey });
}

// the new question goes on top, like the server lists them
export function useAddQuestion(courseId: string, topicId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: QuestionInput) =>
			api.post(questionsPath(courseId, topicId), question, input),
		onSuccess: (created) =>
			updateTopicQuestions(queryClient, courseId, topicId, (questions) => [
				created,
				...questions,
			]),
	});
}

export function useUpdateQuestion(courseId: string, topicId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...input }: QuestionInput & { id: string }) =>
			api.patch(`${questionsPath(courseId, topicId)}/${id}`, question, input),
		onSuccess: (updated) =>
			updateTopicQuestions(queryClient, courseId, topicId, (questions) =>
				questions.map((saved) => (saved.id === updated.id ? updated : saved))
			),
	});
}

export function useDeleteQuestion(courseId: string, topicId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) =>
			api.delete(`${questionsPath(courseId, topicId)}/${id}`),
		onSuccess: (_, id) =>
			updateTopicQuestions(queryClient, courseId, topicId, (questions) =>
				questions.filter((saved) => saved.id !== id)
			),
	});
}

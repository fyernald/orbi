'use client';

import {
	approveTopicQuestionsOutput,
	chatAnswer,
	question,
	reviewTopic,
	type ChatAnswer,
	type QuestionStatus,
	type ReviewTopic,
} from '@orbi/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api';
import { approveTopic, pendingCount, replaceQuestion } from './review-cache';

export const reviewKey = ['questions', 'review'] as const;

// The tutor adds questions from the course page, so the list loads again every
// time a page that shows it opens
export function useReviewQuestions() {
	return useQuery({
		queryKey: reviewKey,
		queryFn: () => api.get('/questions/review', z.array(reviewTopic)),
		staleTime: 0,
	});
}

// undefined while it loads
export function usePendingQuestionCount() {
	const review = useReviewQuestions();
	return review.data && pendingCount(review.data);
}

// approve, reject, or pending again to undo
export function useSetQuestionStatus() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: QuestionStatus }) =>
			api.patch(`/questions/${id}`, question, { status }),
		onSuccess: (updated) => {
			queryClient.setQueryData<ReviewTopic[]>(
				reviewKey,
				(groups) => groups && replaceQuestion(groups, updated)
			);
		},
	});
}

export function useApproveTopic(courseId: string, topicId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () =>
			api.post(
				`/courses/${courseId}/topics/${topicId}/questions/approve`,
				approveTopicQuestionsOutput
			),
		onSuccess: () => {
			queryClient.setQueryData<ReviewTopic[]>(
				reviewKey,
				(groups) => groups && approveTopic(groups, topicId)
			);
		},
	});
}

const chatAnswersKey = (questionIds: string[]) =>
	['questions', 'chat-answers', questionIds.join(',')] as const;

// the answers already given to one set of questions in the chat; none while the
// set is still being written
export function useChatAnswers(questionIds: string[]) {
	return useQuery({
		queryKey: chatAnswersKey(questionIds),
		queryFn: () =>
			api.get(
				`/questions/chat-answers?ids=${questionIds.join(',')}`,
				z.array(chatAnswer)
			),
		enabled: questionIds.length > 0,
	});
}

// Each question in the chat takes one answer. If it was already answered (another
// tab), the server says so and the saved answer loads instead.
export function useAnswerInChat(questionIds: string[]) {
	const queryClient = useQueryClient();
	const key = chatAnswersKey(questionIds);
	return useMutation({
		mutationFn: ({ id, choice }: { id: string; choice: number }) =>
			api.post(`/questions/${id}/chat-answer`, chatAnswer, { choice }),
		onSuccess: (saved) => {
			queryClient.setQueryData<ChatAnswer[]>(key, (answers) => [
				...(answers ?? []).filter(
					({ questionId }) => questionId !== saved.questionId
				),
				saved,
			]);
		},
		onError: (error) => {
			if (error instanceof ApiError && error.status === 409) {
				void queryClient.invalidateQueries({ queryKey: key, exact: true });
			}
		},
	});
}

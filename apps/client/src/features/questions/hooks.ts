'use client';

import {
	approveTopicQuestionsOutput,
	chatAnswer,
	question,
	reviewTopic,
	type ChatAnswer,
	type QuestionStatus,
	type ReportQuestionInput,
	type ReviewTopic,
} from '@orbi/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { masteryKey } from '@/features/courses/query-keys';
import { todayKey } from '@/features/today/hooks';
import { api, ApiError } from '@/lib/api';
import { approveTopic, pendingCount, replaceQuestion } from './review-cache';
import { allQuestionSetsKey } from './set-hooks';

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

// approve, reject, or pending again to undo; a set leaves out its rejected questions
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
			void queryClient.invalidateQueries({ queryKey: allQuestionSetsKey });
			// answers to a rejected question stop counting toward the score
			void queryClient.invalidateQueries({ queryKey: masteryKey });
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

// a reported question comes back rejected, so it leaves the review list like a
// rejected one; a study session decides itself what to show next
export function useReportQuestion() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...report }: ReportQuestionInput & { id: string }) =>
			api.post(`/questions/${id}/report`, question, report),
		onSuccess: (rejected) => {
			queryClient.setQueryData<ReviewTopic[]>(
				reviewKey,
				(groups) => groups && replaceQuestion(groups, rejected)
			);
			void queryClient.invalidateQueries({ queryKey: allQuestionSetsKey });
			void queryClient.invalidateQueries({ queryKey: masteryKey });
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
			void queryClient.invalidateQueries({ queryKey: masteryKey });
			// an answered question is scheduled, so it leaves today's study list
			void queryClient.invalidateQueries({ queryKey: todayKey });
		},
		onError: (error) => {
			if (error instanceof ApiError && error.status === 409) {
				void queryClient.invalidateQueries({ queryKey: key, exact: true });
			}
		},
	});
}

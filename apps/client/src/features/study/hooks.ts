'use client';

import { answerExplanation, sessionAnswer, studySession } from '@orbi/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { masteryKey } from '@/features/courses/query-keys';
import { todayKey } from '@/features/today/hooks';
import { usageKey } from '@/features/usage/hooks';
import { api } from '@/lib/api';

const studyKey = (courseId: string, topicId: string, today: boolean) =>
	['study', courseId, topicId, today ? 'today' : 'all'] as const;

// The questions stay as they were when the session started, so a refetch never
// changes them mid-session. Leaving the page drops them, so the next session
// loads the latest approved questions.
// With today, only the topic's questions in today's study list.
export function useStudySession(
	courseId: string,
	topicId: string,
	today = false
) {
	return useQuery({
		queryKey: studyKey(courseId, topicId, today),
		queryFn: () =>
			api.get(
				`/courses/${courseId}/topics/${topicId}/study${today ? '?today=1' : ''}`,
				studySession
			),
		staleTime: Infinity,
		gcTime: 0,
		refetchOnWindowFocus: false,
	});
}

// the server checks the answer and saves it for the mastery score; the question
// leaves today's study list
export function useAnswerInSession() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, choice }: { id: string; choice: number }) =>
			api.post(`/questions/${id}/session-answer`, sessionAnswer, { choice }),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: masteryKey });
			void queryClient.invalidateQueries({ queryKey: todayKey });
		},
	});
}

// why a wrong answer is wrong, written by the AI; the server keeps it, so asking
// again for the same choice gives back the same text
export function useExplainAnswer() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, choice }: { id: string; choice: number }) =>
			api.post(`/questions/${id}/explanation`, answerExplanation, { choice }),
		// a new explanation is a model call
		onSettled: () => queryClient.invalidateQueries({ queryKey: usageKey }),
	});
}

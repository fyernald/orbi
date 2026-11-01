'use client';

import { sessionAnswer, studySession } from '@orbi/shared';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const studyKey = (courseId: string, topicId: string) =>
	['study', courseId, topicId] as const;

// The questions stay as they were when the session started, so a refetch never
// changes them mid-session. Leaving the page drops them, so the next session
// loads the latest approved questions.
export function useStudySession(courseId: string, topicId: string) {
	return useQuery({
		queryKey: studyKey(courseId, topicId),
		queryFn: () =>
			api.get(`/courses/${courseId}/topics/${topicId}/study`, studySession),
		staleTime: Infinity,
		gcTime: 0,
		refetchOnWindowFocus: false,
	});
}

// the server checks the answer and saves it for the mastery score
export function useAnswerInSession() {
	return useMutation({
		mutationFn: ({ id, choice }: { id: string; choice: number }) =>
			api.post(`/questions/${id}/session-answer`, sessionAnswer, { choice }),
	});
}

'use client';

import { questionSet } from '@orbi/shared';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api';

// Every course's sets, so a change made away from the course page (a report in the
// chat, a reject on the review page) can mark them all as old
export const allQuestionSetsKey = ['questions', 'sets'] as const;
export const questionSetsKey = (courseId: string) =>
	[...allQuestionSetsKey, courseId] as const;

// what the tutor made in the course, newest first
export function useQuestionSets(courseId: string) {
	return useQuery({
		queryKey: questionSetsKey(courseId),
		queryFn: () =>
			api.get(`/courses/${courseId}/question-sets`, z.array(questionSet)),
	});
}

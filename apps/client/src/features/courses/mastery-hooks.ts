'use client';

import { topicMastery, type TopicMastery } from '@orbi/shared';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { z } from 'zod';
import { api } from '@/lib/api';
import { courseMastery } from './mastery';
import { courseMasteryKey } from './query-keys';

// the score of every topic of the course, in course order
export function useCourseMastery(courseId: string) {
	return useQuery({
		queryKey: courseMasteryKey(courseId),
		queryFn: () =>
			api.get(`/courses/${courseId}/mastery`, z.array(topicMastery)),
	});
}

// Each topic's score by its id, or undefined while it loads. A topic added since
// the scores loaded has no answers yet, so it reads as not started.
export function useTopicScores(
	courseId: string
): ((topicId: string) => TopicMastery['score']) | undefined {
	const { data } = useCourseMastery(courseId);
	return useMemo(() => {
		if (!data) return undefined;
		const scores = new Map(data.map(({ topicId, score }) => [topicId, score]));
		return (topicId: string) => scores.get(topicId) ?? null;
	}, [data]);
}

// the course's score and its topics' scores; the topics' are undefined while they load
export function useCourseScore(courseId: string) {
	const { data } = useCourseMastery(courseId);
	return useMemo(() => {
		const scores = data?.map(({ score }) => score);
		return { scores, score: scores ? courseMastery(scores) : null };
	}, [data]);
}

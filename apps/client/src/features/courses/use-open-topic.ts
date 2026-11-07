'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { courseRoute } from '@/lib/routes';
import { parseTopicParam } from './topic-param';

type OpenTopicOptions = {
	// for a fix-up rather than the student's choice, so Back does not return to it
	replace?: boolean;
};

// The topic chat that is open on the course page, kept in the address as ?topic=,
// so a reload, Back and Forward, and a shared link open the same chat. Next.js keeps
// useSearchParams in step with history.pushState, without asking the server again.
// The first change drops the one-time ?tool=, ?ask=, ?model= and ?think= from Home,
// so a reload does not fill the message box again.
export function useOpenTopic(courseId: string) {
	const topicId = parseTopicParam(useSearchParams().get('topic')) ?? null;

	const openTopic = useCallback(
		(next: string | null, { replace = false }: OpenTopicOptions = {}) => {
			const href = courseRoute(courseId, { topic: next ?? undefined });
			if (href === `${window.location.pathname}${window.location.search}`) {
				return;
			}
			if (replace) window.history.replaceState(null, '', href);
			else window.history.pushState(null, '', href);
		},
		[courseId]
	);

	return { topicId, openTopic };
}

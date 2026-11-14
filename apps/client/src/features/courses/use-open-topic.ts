'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useEffectEvent } from 'react';
import { courseRoute } from '@/lib/routes';
import { parseTopicParam } from './topic-param';

type OpenTopicOptions = {
	// for a fix-up rather than the student's choice, so Back does not return to it
	replace?: boolean;
};

// The topic chat that is open on the course page, kept in the address as ?topic=,
// so a reload, Back and Forward, and a shared link open the same chat. Next.js keeps
// useSearchParams in step with history.pushState, without asking the server again.
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

	// The one-time ?tool=, ?ask=, ?model= and ?think= from Home are read once, when
	// the page opens, so they leave the address straight away. A reload then opens
	// the same chat without putting a question that was already sent back in the box.
	const dropStartParams = useEffectEvent(() =>
		openTopic(topicId, { replace: true })
	);
	useEffect(() => {
		dropStartParams();
	}, []);

	return { topicId, openTopic };
}

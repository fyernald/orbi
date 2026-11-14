'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useEffectEvent } from 'react';
import {
	courseAddressHref,
	notesHistoryState,
	parseCourseAddress,
	wereNotesOpenedHere,
	type CourseAddress,
} from './course-address';

type Move = 'push' | 'replace';

const openedHere = () => wereNotesOpenedHere(window.history.state);

// The chat and the notes that show on the course page, kept in the address, so a
// reload, Back and Forward, and a shared link show the same. Next.js keeps
// useSearchParams in step with history.pushState, without asking the server again.
export function useCourseAddress(courseId: string) {
	const { topicId, notesTopicId } = parseCourseAddress(useSearchParams());

	const go = useCallback(
		(changes: Partial<CourseAddress>, move: Move, notesOpenedHere: boolean) => {
			const current = parseCourseAddress(
				new URLSearchParams(window.location.search)
			);
			const href = courseAddressHref(courseId, { ...current, ...changes });
			if (href === `${window.location.pathname}${window.location.search}`) {
				return;
			}
			const state = notesHistoryState(notesOpenedHere);
			if (move === 'replace') window.history.replaceState(state, '', href);
			else window.history.pushState(state, '', href);
		},
		[courseId]
	);

	// the student's choice of chat, which also closes the notes
	const openTopic = useCallback(
		(next: string | null) =>
			go({ topicId: next, notesTopicId: null }, 'push', false),
		[go]
	);

	// From the chat, a new entry, so Back returns to it. From the notes of another
	// topic, the entry is swapped, so Back still goes to the chat.
	const openNotes = useCallback(
		(next: string) => {
			const notesOpen = parseCourseAddress(
				new URLSearchParams(window.location.search)
			).notesTopicId;
			if (notesOpen) go({ notesTopicId: next }, 'replace', openedHere());
			else go({ notesTopicId: next }, 'push', true);
		},
		[go]
	);

	// the same as the browser's Back button when the notes were opened here
	const closeNotes = useCallback(() => {
		if (openedHere()) window.history.back();
		else go({ notesTopicId: null }, 'replace', false);
	}, [go]);

	// for a fix-up rather than the student's choice, so Back does not return to it,
	// like a link to a topic that was deleted since
	const fixAddress = useCallback(
		(changes: Partial<CourseAddress>) => go(changes, 'replace', openedHere()),
		[go]
	);

	// The one-time ?tool=, ?ask=, ?model= and ?think= from Home are read once, when
	// the page opens, so they leave the address straight away. A reload then opens
	// the same chat without putting a question that was already sent back in the box.
	const dropStartParams = useEffectEvent(() => fixAddress({}));
	useEffect(() => {
		dropStartParams();
	}, []);

	return {
		topicId,
		notesTopicId,
		openTopic,
		openNotes,
		closeNotes,
		fixAddress,
	};
}

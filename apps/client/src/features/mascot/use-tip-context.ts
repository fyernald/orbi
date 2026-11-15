'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { parseCourseAddress } from '@/features/courses/course-address';
import { useCourses, useTopics } from '@/features/courses/hooks';
import { tipPage, type TipContext } from './tips';

// What the cat can see from where it sits: the page, the courses, and on a
// course page its topics and the open one. Everything comes from queries the
// pages load anyway.
export function useTipContext(): TipContext {
	const page = tipPage(usePathname());
	const address = parseCourseAddress(useSearchParams());
	const courseId = page.kind === 'course' ? page.courseId : '';
	const courses = useCourses();
	const topics = useTopics(courseId, { enabled: courseId !== '' });

	const list = courseId && topics.data ? topics.data : undefined;
	const openId = address.notesTopicId ?? address.topicId;
	const open = list?.find((topic) => topic.id === openId);

	return {
		page,
		courseCount: courses.data?.length ?? null,
		course: list && {
			id: courseId,
			topicCount: list.length,
			noteCount: list.reduce((sum, topic) => sum + topic.noteCount, 0),
			firstTopicId: list[0]?.id ?? null,
		},
		topic: open && { id: open.id, noteCount: open.noteCount },
		notesOpen: address.notesTopicId !== null,
	};
}

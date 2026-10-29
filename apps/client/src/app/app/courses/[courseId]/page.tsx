import {
	TUTOR_ACTIONS,
	TUTOR_MESSAGE_MAX_LENGTH,
	type TutorAction,
} from '@orbi/shared';
import type { Metadata } from 'next';
import { CourseView } from '@/features/courses/components/course-view';

export const metadata: Metadata = { title: 'Course' };

const isTutorAction = (value: unknown): value is TutorAction =>
	TUTOR_ACTIONS.includes(value as TutorAction);

// ?tool= and ?ask= come from the shortcuts on the courses page
export default async function CoursePage({
	params,
	searchParams,
}: {
	params: Promise<{ courseId: string }>;
	searchParams: Promise<{ tool?: string; ask?: string }>;
}) {
	const { courseId } = await params;
	const { tool, ask } = await searchParams;

	return (
		<CourseView
			courseId={courseId}
			start={{
				action: isTutorAction(tool) ? tool : undefined,
				message:
					typeof ask === 'string'
						? ask.slice(0, TUTOR_MESSAGE_MAX_LENGTH)
						: undefined,
			}}
		/>
	);
}

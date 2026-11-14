import {
	TUTOR_ACTIONS,
	TUTOR_MESSAGE_MAX_LENGTH,
	type TutorAction,
} from '@orbi/shared';
import type { Metadata } from 'next';
import { CourseView } from '@/features/courses/components/course-view';
import { courseTitle } from '@/features/courses/course-title';
import { getServerCourse } from '@/features/courses/server';
import { parseTopicParam } from '@/features/courses/topic-param';

type CoursePageParams = { params: Promise<{ courseId: string }> };

// the course name in the tab; a rename on the page updates it in CourseView
export async function generateMetadata({
	params,
}: CoursePageParams): Promise<Metadata> {
	const { courseId } = await params;
	return { title: courseTitle(await getServerCourse(courseId)) };
}

const isTutorAction = (value: unknown): value is TutorAction =>
	TUTOR_ACTIONS.includes(value as TutorAction);

const MODEL_ID_MAX_LENGTH = 100;

// ?tool= and ?ask= come from the shortcuts on the courses page; ?topic=, ?model=
// and ?think= come from the message box on Home
export default async function CoursePage({
	params,
	searchParams,
}: CoursePageParams & {
	searchParams: Promise<{
		tool?: string;
		ask?: string;
		topic?: string;
		model?: string;
		think?: string;
	}>;
}) {
	const { courseId } = await params;
	const { tool, ask, topic, model, think } = await searchParams;

	return (
		<CourseView
			courseId={courseId}
			start={{
				action: isTutorAction(tool) ? tool : undefined,
				message:
					typeof ask === 'string'
						? ask.slice(0, TUTOR_MESSAGE_MAX_LENGTH)
						: undefined,
				topicId: parseTopicParam(topic),
				modelId:
					typeof model === 'string'
						? model.slice(0, MODEL_ID_MAX_LENGTH)
						: undefined,
				thinking: think === '1' ? true : undefined,
			}}
		/>
	);
}

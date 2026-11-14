'use client';

import type { TutorRequestInput } from '@orbi/shared';
import { useRouter } from 'next/navigation';
import { LoadError } from '@/components/load-error';
import { useAllTopics } from '@/features/courses/hooks';
import { NoteComposer } from '@/features/tutor/components/note-composer';
import { apiErrorMessage } from '@/lib/api';
import { courseRoute } from '@/lib/routes';
import { ComposerPlaceholder } from './composer-placeholder';
import { NoTopicsYet } from './no-topics-yet';

// Home's message box, on the student's own topics, the one with the newest chat
// first. Sending opens that topic's chat in its course with the message, action,
// and model ready; files are attached there, because they are saved to a topic.
export function HomeComposer() {
	const topics = useAllTopics();
	const router = useRouter();

	if (topics.isPending) return <ComposerPlaceholder />;
	if (topics.isError) {
		return (
			<LoadError
				message={apiErrorMessage(topics.error)}
				onRetry={() => void topics.refetch()}
			/>
		);
	}
	if (topics.data.length === 0) return <NoTopicsYet />;

	const send = (request: TutorRequestInput) => {
		const topic = topics.data.find((item) => item.id === request.topicId);
		if (!topic) return;
		router.push(
			courseRoute(topic.courseId, {
				topic: topic.id,
				tool: request.action,
				ask: request.message,
				model: request.modelId,
				think: request.thinking,
			})
		);
	};

	return (
		<NoteComposer
			topics={topics.data.map(({ id, courseName, name }) => ({
				id,
				course: courseName,
				name,
			}))}
			onSend={send}
		/>
	);
}

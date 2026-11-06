'use client';

import { LoadError } from '@/components/load-error';
import { apiErrorMessage } from '@/lib/api';
import { useStudySession } from '../hooks';
import { SessionAside } from './session-aside';
import { SessionEmpty } from './session-empty';
import { SessionHeader } from './session-header';
import { SessionLayout } from './session-layout';
import { SessionLoading } from './session-loading';
import { StudyRunner } from './study-runner';

type StudySessionViewProps = {
	courseId: string;
	topicId: string;
	// only the topic's questions in today's study list
	today?: boolean;
};

export function StudySessionView({
	courseId,
	topicId,
	today = false,
}: StudySessionViewProps) {
	const session = useStudySession(courseId, topicId, today);

	if (session.isPending) return <SessionLoading />;
	if (session.isError) {
		return (
			<SessionLayout>
				<LoadError
					message={apiErrorMessage(session.error)}
					onRetry={() => void session.refetch()}
				/>
			</SessionLayout>
		);
	}
	const { courseName, topicName, questions, pendingCount } = session.data;
	if (questions.length === 0) {
		const names = { courseId, courseName, topicName };
		return (
			<SessionLayout start={<SessionAside {...names} />}>
				<SessionHeader {...names} />
				<SessionEmpty
					courseId={courseId}
					topicName={topicName}
					pendingCount={pendingCount}
					today={today}
				/>
			</SessionLayout>
		);
	}

	return (
		<StudyRunner
			// new questions after "Study again" start a new run
			key={session.dataUpdatedAt}
			courseId={courseId}
			session={session.data}
			today={today}
			restarting={session.isFetching}
			onRestart={() => void session.refetch()}
		/>
	);
}

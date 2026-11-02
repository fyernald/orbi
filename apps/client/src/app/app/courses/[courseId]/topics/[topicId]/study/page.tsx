import type { Metadata } from 'next';
import { StudySessionView } from '@/features/study/components/study-session-view';

export const metadata: Metadata = { title: 'Study session' };

export default async function StudySessionPage({
	params,
}: {
	params: Promise<{ courseId: string; topicId: string }>;
}) {
	const { courseId, topicId } = await params;

	return (
		<section className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 md:px-7">
			<StudySessionView courseId={courseId} topicId={topicId} />
		</section>
	);
}

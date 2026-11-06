import type { Metadata } from 'next';
import { StudySessionView } from '@/features/study/components/study-session-view';

export const metadata: Metadata = { title: 'Study session' };

// ?today=1 comes from today's study list on Home
export default async function StudySessionPage({
	params,
	searchParams,
}: {
	params: Promise<{ courseId: string; topicId: string }>;
	searchParams: Promise<{ today?: string }>;
}) {
	const { courseId, topicId } = await params;
	const { today } = await searchParams;

	// the session lays itself out by this width, so the app sidebar counts
	return (
		<section className="@container mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-7">
			<StudySessionView
				courseId={courseId}
				topicId={topicId}
				today={today === '1'}
			/>
		</section>
	);
}

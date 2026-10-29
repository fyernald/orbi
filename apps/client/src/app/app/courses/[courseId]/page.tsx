import type { Metadata } from 'next';
import { CourseView } from '@/features/courses/components/course-view';

export const metadata: Metadata = { title: 'Course' };

export default async function CoursePage({
	params,
}: {
	params: Promise<{ courseId: string }>;
}) {
	const { courseId } = await params;

	return (
		<section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-8">
			<CourseView courseId={courseId} />
		</section>
	);
}

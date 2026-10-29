import type { Metadata } from 'next';
import { NewCourseForm } from '@/features/courses/components/new-course-form';
import { PageHeader } from '@/features/courses/components/page-header';
import { routes } from '@/lib/routes';

export const metadata: Metadata = { title: 'New course' };

export default function NewCoursePage() {
	return (
		<section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-8">
			<PageHeader
				backHref={routes.courses}
				backLabel="Back to courses"
				title="New course"
				subtitle="Set up a course and its first topics in three short steps."
			/>
			<NewCourseForm />
		</section>
	);
}

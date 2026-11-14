'use client';

import { LoadError } from '@/components/load-error';
import type { ComposerPreset } from '@/features/tutor/components/note-composer';
import { usePageTitle } from '@/hooks/use-page-title';
import { apiErrorMessage, isClientError } from '@/lib/api';
import { useCourse } from '../hooks';
import { BackToCourses } from './back-to-courses';
import { CourseWorkspace } from './course-workspace';
import { ListLoader } from './list-loader';

type CourseViewProps = {
	courseId: string;
	// what the tutor starts with when the page opens
	start: Omit<ComposerPreset, 'version'>;
};

export function CourseView({ courseId, start }: CourseViewProps) {
	const course = useCourse(courseId);
	usePageTitle(course.data?.name);

	if (course.isPending) return <ListLoader />;
	if (course.isError) {
		return (
			<div className="flex flex-col gap-3 px-4 py-8 md:px-7">
				{/* a wrong link, or a course of another user */}
				{isClientError(course.error) ? (
					<>
						<BackToCourses />
						<p className="text-muted-foreground">This course does not exist.</p>
					</>
				) : (
					<LoadError
						message={apiErrorMessage(course.error)}
						onRetry={() => course.refetch()}
					/>
				)}
			</div>
		);
	}

	return <CourseWorkspace course={course.data} start={start} />;
}

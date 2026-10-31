'use client';

import type { TutorAction } from '@orbi/shared';
import { ApiError, apiErrorMessage } from '@/lib/api';
import { useCourse } from '../hooks';
import { BackToCourses } from './back-to-courses';
import { CourseWorkspace } from './course-workspace';
import { ListLoader } from './list-loader';
import { LoadError } from '@/components/load-error';

type CourseViewProps = {
	courseId: string;
	// what the tutor starts with when the page opens
	start: { action?: TutorAction; message?: string };
};

export function CourseView({ courseId, start }: CourseViewProps) {
	const course = useCourse(courseId);

	if (course.isPending) return <ListLoader />;
	if (course.isError) {
		return (
			<div className="flex flex-col gap-3 px-4 py-8 md:px-7">
				{/* a wrong link, or a course of another user */}
				{course.error instanceof ApiError && course.error.status < 500 ? (
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

'use client';

import { apiErrorMessage } from '@/lib/api';
import { useCourses } from '../hooks';
import { CourseList } from './course-list';
import { ListLoader } from './list-loader';
import { LoadError } from './load-error';

export function CoursesView() {
	const courses = useCourses();

	if (courses.isPending) return <ListLoader />;
	if (courses.isError) {
		return (
			<LoadError
				message={apiErrorMessage(courses.error)}
				onRetry={() => courses.refetch()}
			/>
		);
	}
	return <CourseList courses={courses.data} />;
}

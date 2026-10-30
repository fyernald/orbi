'use client';

import { useState } from 'react';
import { apiErrorMessage } from '@/lib/api';
import { filterCourses, type CourseFilters } from '../course-filters';
import { groupCourses } from '../course-groups';
import { useCourses } from '../hooks';
import { upNextCourse } from '../up-next';
import { CourseGroupList } from './course-group-list';
import { CoursesEmpty } from './courses-empty';
import { CoursesToolbar } from './courses-toolbar';
import { ListLoader } from './list-loader';
import { LoadError } from './load-error';
import { NoMatchingCourses } from './no-matching-courses';
import { UpNextRow } from './up-next-row';

const noFilters: CourseFilters = { query: '', goal: 'all' };

// search and goal filters only help once the list is long
const SEARCH_FROM = 7;

export function CoursesView() {
	const courses = useCourses();
	const [filters, setFilters] = useState<CourseFilters>(noFilters);

	if (courses.isPending) return <ListLoader />;
	if (courses.isError) {
		return (
			<LoadError
				message={apiErrorMessage(courses.error)}
				onRetry={() => courses.refetch()}
			/>
		);
	}
	if (courses.data.length === 0) return <CoursesEmpty />;

	const now = new Date();
	const upNext = upNextCourse(courses.data, now);
	const searchable = courses.data.length >= SEARCH_FROM;
	const shown = searchable
		? filterCourses(courses.data, filters)
		: courses.data;

	return (
		<div className="flex flex-col gap-8">
			{upNext && <UpNextRow course={upNext} now={now} />}
			{searchable && (
				<CoursesToolbar filters={filters} onFiltersChange={setFilters} />
			)}
			{shown.length === 0 ? (
				<NoMatchingCourses onClear={() => setFilters(noFilters)} />
			) : (
				<CourseGroupList groups={groupCourses(shown, now)} now={now} />
			)}
		</div>
	);
}

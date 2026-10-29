'use client';

import { useState } from 'react';
import { apiErrorMessage } from '@/lib/api';
import { filterCourses, type CourseFilters } from '../course-filters';
import { useCourses } from '../hooks';
import { upNextCourse } from '../up-next';
import { CourseGrid } from './course-grid';
import { CoursesEmpty } from './courses-empty';
import { CoursesToolbar } from './courses-toolbar';
import { ListLoader } from './list-loader';
import { LoadError } from './load-error';
import { NoMatchingCourses } from './no-matching-courses';
import { UpNextCard } from './up-next-card';

const noFilters: CourseFilters = { query: '', goal: 'all', sort: 'recent' };

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
	const shown = filterCourses(courses.data, filters);
	const filtering = filters.query !== '' || filters.goal !== 'all';

	return (
		<div className="flex flex-col gap-8">
			{upNext && <UpNextCard course={upNext} now={now} />}
			<section
				aria-labelledby="all-courses-title"
				className="flex flex-col gap-4"
			>
				<div className="flex items-center gap-2">
					<h2 id="all-courses-title" className="font-semibold">
						All courses
					</h2>
					<span className="text-sm text-muted-foreground tabular-nums">
						{courses.data.length}
					</span>
				</div>
				<CoursesToolbar filters={filters} onFiltersChange={setFilters} />
				{shown.length === 0 ? (
					<NoMatchingCourses onClear={() => setFilters(noFilters)} />
				) : (
					<CourseGrid courses={shown} now={now} showNewTile={!filtering} />
				)}
			</section>
		</div>
	);
}

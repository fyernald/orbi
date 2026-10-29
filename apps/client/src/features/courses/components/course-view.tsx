'use client';

import { ApiError, apiErrorMessage } from '@/lib/api';
import { useCourse, useTopics } from '../hooks';
import { BackToCourses } from './back-to-courses';
import { CourseHero } from './course-hero';
import { CourseStats } from './course-stats';
import { ExamCard } from './exam-card';
import { ListLoader } from './list-loader';
import { LoadError } from './load-error';
import { NextSteps } from './next-steps';
import { TopicsPanel } from './topics-panel';

export function CourseView({ courseId }: { courseId: string }) {
	const course = useCourse(courseId);
	// the same query as the topics panel, for the note count
	const topics = useTopics(courseId);

	if (course.isPending) return <ListLoader />;
	if (course.isError) {
		// a wrong link, or a course of another user
		if (course.error instanceof ApiError && course.error.status < 500) {
			return (
				<div className="flex flex-col gap-3">
					<BackToCourses />
					<p className="text-muted-foreground">This course does not exist.</p>
				</div>
			);
		}
		return (
			<LoadError
				message={apiErrorMessage(course.error)}
				onRetry={() => course.refetch()}
			/>
		);
	}

	const noteCount = topics.data?.reduce(
		(sum, topic) => sum + topic.noteCount,
		0
	);

	return (
		<>
			<CourseHero course={course.data} />
			<CourseStats course={course.data} noteCount={noteCount} />
			<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
				<TopicsPanel course={course.data} />
				<aside className="flex flex-col gap-4">
					{course.data.examDate && <ExamCard examDate={course.data.examDate} />}
					<NextSteps
						topicCount={course.data.topicCount}
						noteCount={noteCount}
					/>
				</aside>
			</div>
		</>
	);
}

'use client';

import { coursesSummary } from '../courses-summary';
import { useCourses } from '../hooks';

// the line under the page title: what matters most once the courses are loaded
export function CoursesSummary() {
	const courses = useCourses();
	const text = courses.data?.length
		? coursesSummary(courses.data, new Date())
		: 'Each course holds the topics, notes, and questions of one class.';

	return <p className="text-[15px] text-subtle-foreground">{text}</p>;
}

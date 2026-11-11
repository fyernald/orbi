import 'server-only';

import { course } from '@orbi/shared';
import { isClientErrorStatus } from '@/lib/api';
import { apiUrl, forwardedHeaders } from '@/lib/api-url';
import type { ServerCourse } from './course-title';

// Asks the API for one course, with the browser's cookie, while the page renders.
// Never throws: the caller (the tab title) has a fallback for every answer.
export async function getServerCourse(courseId: string): Promise<ServerCourse> {
	try {
		const response = await fetch(
			`${apiUrl}/api/courses/${encodeURIComponent(courseId)}`,
			{ headers: await forwardedHeaders(), cache: 'no-store' }
		);
		if (isClientErrorStatus(response.status)) return { status: 'missing' };
		if (!response.ok) return { status: 'unavailable' };
		return { status: 'found', course: course.parse(await response.json()) };
	} catch {
		return { status: 'unavailable' };
	}
}

import type { Course } from '@orbi/shared';
import { formatTimeAgo } from '@/lib/dates';
import { noteCountLabel } from './note-count';
import { topicCountLabel } from './topic-count';

// the line under a course name, for example "3 topics · 6 notes · active yesterday";
// until a course has notes, it says what to add instead
export function courseStatus(course: Course, now: Date): string {
	if (course.topicCount === 0) return 'No topics yet';
	const topics = topicCountLabel(course.topicCount);
	if (course.noteCount === 0) return `${topics} · add notes to get questions`;
	const notes = noteCountLabel(course.noteCount);
	return `${topics} · ${notes} · active ${formatTimeAgo(course.lastActivityAt, now)}`;
}

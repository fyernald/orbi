import type { Course } from '@orbi/shared';
import { coursesWithExamAhead, daysUntil } from './exam-date';

function whenIsExam(days: number): string {
	if (days === 0) return 'is today';
	if (days === 1) return 'is tomorrow';
	return `in ${days} days`;
}

// one sentence about what matters most across all courses, for example
// "Biology 101 exam in 12 days. 1 more exam after that."
export function coursesSummary(courses: Course[], now: Date): string {
	const [next, ...rest] = coursesWithExamAhead(courses, now);
	if (!next) return 'No exams coming up.';

	const first = `${next.name} exam ${whenIsExam(daysUntil(next.examDate!, now))}.`;
	if (rest.length === 0) return first;
	const more = rest.length === 1 ? '1 more exam' : `${rest.length} more exams`;
	return `${first} ${more} after that.`;
}

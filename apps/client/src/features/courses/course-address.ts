import { courseRoute } from '@/lib/routes';
import { parseTopicParam } from './topic-param';

// What the course page shows, from its address: the chat of a topic (?topic=, or
// the whole-course chat without it), and a topic's notes in place of that chat
// (?notes=). The chat stays behind the notes, so going back finds it as it was.
export type CourseAddress = {
	topicId: string | null;
	notesTopicId: string | null;
};

type SearchParams = { get(name: string): string | null };

export function parseCourseAddress(params: SearchParams): CourseAddress {
	return {
		topicId: parseTopicParam(params.get('topic')) ?? null,
		notesTopicId: parseTopicParam(params.get('notes')) ?? null,
	};
}

// the one-time ?tool=, ?ask=, ?model= and ?think= are left out
export function courseAddressHref(
	courseId: string,
	{ topicId, notesTopicId }: CourseAddress
): string {
	return courseRoute(courseId, {
		topic: topicId ?? undefined,
		notes: notesTopicId ?? undefined,
	});
}

// Set on the history entry the notes were opened in, on this page. Back from the
// notes then goes back in history, just like the browser's Back button. Notes
// opened from a link or a new tab have no chat entry to go back to.
const NOTES_OPENED_HERE = 'orbiNotesOpenedHere';

export function notesHistoryState(openedHere: boolean) {
	return openedHere ? { [NOTES_OPENED_HERE]: true } : null;
}

export function wereNotesOpenedHere(state: unknown): boolean {
	return (
		typeof state === 'object' &&
		state !== null &&
		(state as Record<string, unknown>)[NOTES_OPENED_HERE] === true
	);
}

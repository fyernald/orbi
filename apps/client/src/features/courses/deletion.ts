import type { Course, Topic } from '@orbi/shared';
import { noteCountLabel } from './note-count';
import { topicCountLabel } from './topic-count';

const STUDY_WORK = 'Its questions, answers, and tutor chats';

// what else goes with a deleted course, for the dialog that asks first
export function courseDeletes({
	topicCount,
	noteCount,
}: Pick<Course, 'topicCount' | 'noteCount'>): string[] {
	return [
		...(topicCount > 0 ? [topicCountLabel(topicCount)] : []),
		...(noteCount > 0 ? [noteCountLabel(noteCount)] : []),
		STUDY_WORK,
	];
}

// the whole-course chat stays; only the topic's own chats go
export function topicDeletes({
	noteCount,
}: Pick<Topic, 'noteCount'>): string[] {
	return [...(noteCount > 0 ? [noteCountLabel(noteCount)] : []), STUDY_WORK];
}

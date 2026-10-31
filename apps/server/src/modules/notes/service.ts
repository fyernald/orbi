import type { CreateNoteInput, Note } from '@orbi/shared';
import { NotFoundError } from '../../errors';
import type { NoteRepository } from './repository';
import { noteTitle } from './title';

export interface NoteService {
	listNotes(userId: string, courseId: string, topicId: string): Promise<Note[]>;
	createNote(
		userId: string,
		courseId: string,
		topicId: string,
		input: CreateNoteInput
	): Promise<Note>;
}

export function createNoteService({
	repo,
}: {
	repo: NoteRepository;
}): NoteService {
	// another user's topic answers the same as a missing one, so ids cannot be probed
	async function requireTopic(
		userId: string,
		courseId: string,
		topicId: string
	) {
		if (!(await repo.topicExists(userId, courseId, topicId))) {
			throw new NotFoundError('Topic not found.');
		}
	}

	return {
		async listNotes(userId, courseId, topicId) {
			await requireTopic(userId, courseId, topicId);
			return repo.listNotes(userId, topicId);
		},

		async createNote(userId, courseId, topicId, { title, content }) {
			await requireTopic(userId, courseId, topicId);
			return repo.insertNote(userId, topicId, {
				title: noteTitle(title, content),
				content,
			});
		},
	};
}

import type { CreateNoteInput, Note, UpdateNoteInput } from '@orbi/shared';
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
	updateNote(
		userId: string,
		courseId: string,
		topicId: string,
		noteId: string,
		input: UpdateNoteInput
	): Promise<Note>;
	deleteNote(
		userId: string,
		courseId: string,
		topicId: string,
		noteId: string
	): Promise<void>;
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

		// a title cleared while editing is named after the first line again
		async updateNote(userId, courseId, topicId, noteId, { title, content }) {
			await requireTopic(userId, courseId, topicId);
			const updated = await repo.updateNote(userId, topicId, noteId, {
				title: noteTitle(title, content),
				content,
			});
			if (!updated) throw new NotFoundError('Note not found.');
			return updated;
		},

		// the questions made from it stay, since they belong to the topic
		async deleteNote(userId, courseId, topicId, noteId) {
			await requireTopic(userId, courseId, topicId);
			if (!(await repo.deleteNote(userId, topicId, noteId))) {
				throw new NotFoundError('Note not found.');
			}
		},
	};
}

import type { Note } from '@orbi/shared';
import { and, desc, eq } from 'drizzle-orm';
import type { Db } from '../../db';
import { note, topic } from '../../db/schema';

export interface NoteRepository {
	topicExists(
		userId: string,
		courseId: string,
		topicId: string
	): Promise<boolean>;
	listNotes(userId: string, topicId: string): Promise<Note[]>;
	insertNote(userId: string, topicId: string, input: NoteFields): Promise<Note>;
	updateNote(
		userId: string,
		topicId: string,
		noteId: string,
		input: NoteFields
	): Promise<Note | undefined>;
	// false when nothing of this user matched
	deleteNote(userId: string, topicId: string, noteId: string): Promise<boolean>;
}

type NoteFields = { title: string; content: string };

const noteColumns = {
	id: note.id,
	topicId: note.topicId,
	title: note.title,
	content: note.content,
	createdAt: note.createdAt,
	updatedAt: note.updatedAt,
};

type NoteRow = Omit<Note, 'createdAt' | 'updatedAt'> & {
	createdAt: Date;
	updatedAt: Date;
};

const ownNote = (userId: string, topicId: string, noteId: string) =>
	and(eq(note.userId, userId), eq(note.topicId, topicId), eq(note.id, noteId));

const toApi = ({ createdAt, updatedAt, ...saved }: NoteRow): Note => ({
	...saved,
	createdAt: createdAt.toISOString(),
	updatedAt: updatedAt.toISOString(),
});

export function createNoteRepository(db: Db): NoteRepository {
	return {
		async topicExists(userId, courseId, topicId) {
			const [found] = await db
				.select({ id: topic.id })
				.from(topic)
				.where(
					and(
						eq(topic.userId, userId),
						eq(topic.courseId, courseId),
						eq(topic.id, topicId)
					)
				);
			return found !== undefined;
		},

		// the newest note first, so a note just saved is at the top
		async listNotes(userId, topicId) {
			const rows = await db
				.select(noteColumns)
				.from(note)
				.where(and(eq(note.userId, userId), eq(note.topicId, topicId)))
				.orderBy(desc(note.createdAt), desc(note.id));
			return rows.map(toApi);
		},

		async insertNote(userId, topicId, input) {
			const [created] = await db
				.insert(note)
				.values({ userId, topicId, ...input })
				.returning(noteColumns);
			return toApi(created!);
		},

		async updateNote(userId, topicId, noteId, input) {
			const [updated] = await db
				.update(note)
				.set(input)
				.where(ownNote(userId, topicId, noteId))
				.returning(noteColumns);
			return updated && toApi(updated);
		},

		async deleteNote(userId, topicId, noteId) {
			const deleted = await db
				.delete(note)
				.where(ownNote(userId, topicId, noteId))
				.returning({ id: note.id });
			return deleted.length > 0;
		},
	};
}

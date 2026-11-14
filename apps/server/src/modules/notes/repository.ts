import type { Note } from '@orbi/shared';
import { and, desc, eq, sql } from 'drizzle-orm';
import type { Db } from '../../db';
import { isForeignKeyViolation } from '../../db/errors';
import { note, topic } from '../../db/schema';

export interface NoteRepository {
	topicExists(
		userId: string,
		courseId: string,
		topicId: string
	): Promise<boolean>;
	listNotes(userId: string, topicId: string): Promise<Note[]>;
	// undefined when the topic was deleted since it was checked
	insertNote(
		userId: string,
		topicId: string,
		input: NoteFields
	): Promise<Note | undefined>;
	// all or none are saved; they list in the order given. When notes of the same
	// PDF were saved on the topic in the meantime (the file sent twice at once),
	// those are given back instead, with reused set. Undefined when the topic was
	// deleted since it was checked
	insertSourceNotes(
		userId: string,
		topicId: string,
		inputs: NoteFields[],
		source: NoteSource
	): Promise<{ notes: Note[]; reused: boolean } | undefined>;
	// the notes a PDF with this hash was saved as on the topic, in page order
	listSourceNotes(
		userId: string,
		topicId: string,
		sourceHash: string
	): Promise<Note[]>;
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

// the PDF a note was taken from
export type NoteSource = { name: string; hash: string };

const NOTE_TOPIC_FK = 'note_topic_fk';

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

// the insert's answer, or undefined when its topic is not there any more
async function unlessTopicGone<T>(insert: Promise<T>): Promise<T | undefined> {
	try {
		return await insert;
	} catch (error) {
		if (isForeignKeyViolation(error, NOTE_TOPIC_FK)) return undefined;
		throw error;
	}
}

const toApi = ({ createdAt, updatedAt, ...saved }: NoteRow): Note => ({
	...saved,
	createdAt: createdAt.toISOString(),
	updatedAt: updatedAt.toISOString(),
});

// the notes a PDF was saved as on the topic, newest (the first page) first;
// takes the database or a transaction
async function findSourceNotes(
	db: Db,
	userId: string,
	topicId: string,
	sourceHash: string
) {
	const rows = await db
		.select(noteColumns)
		.from(note)
		.where(
			and(
				eq(note.userId, userId),
				eq(note.topicId, topicId),
				eq(note.sourceHash, sourceHash)
			)
		)
		.orderBy(desc(note.createdAt), desc(note.id));
	return rows.map(toApi);
}

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
			const rows = await unlessTopicGone(
				db
					.insert(note)
					.values({ userId, topicId, ...input })
					.returning(noteColumns)
			);
			return rows && toApi(rows[0]!);
		},

		// the notes are listed newest first, so each one is saved a millisecond
		// newer than the next, and the first one ends up on top. An insert that fails
		// rolls the whole transaction back, so no part of the PDF is left behind
		insertSourceNotes: (userId, topicId, inputs, source) =>
			unlessTopicGone(
				db.transaction(async (tx) => {
					// one save of the same file on a topic at a time; the second waits here,
					// then finds the first one's notes. The lock ends with the transaction.
					await tx.execute(
						sql`select pg_advisory_xact_lock(hashtextextended(${`${topicId}:${source.hash}`}, 0))`
					);
					const saved = await findSourceNotes(tx, userId, topicId, source.hash);
					if (saved.length > 0) return { notes: saved, reused: true };

					const now = Date.now();
					const created = await tx
						.insert(note)
						.values(
							inputs.map((input, index) => ({
								userId,
								topicId,
								...input,
								sourceName: source.name,
								sourceHash: source.hash,
								createdAt: new Date(now - index),
								updatedAt: new Date(now - index),
							}))
						)
						.returning(noteColumns);
					return { notes: created.map(toApi), reused: false };
				})
			),

		listSourceNotes: (userId, topicId, sourceHash) =>
			findSourceNotes(db, userId, topicId, sourceHash),

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

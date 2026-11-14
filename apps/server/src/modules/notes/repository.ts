import type { Note } from '@orbi/shared';
import { and, asc, desc, eq, isNotNull, sql, type SQL } from 'drizzle-orm';
import type { Db } from '../../db';
import { isForeignKeyViolation } from '../../db/errors';
import { note, topic } from '../../db/schema';

export interface NoteRepository {
	topicExists(
		userId: string,
		courseId: string,
		topicId: string
	): Promise<boolean>;
	// the notes the student sees, without the hidden text of their PDFs
	listNotes(userId: string, topicId: string): Promise<Note[]>;
	// undefined when the topic was deleted since it was checked
	insertNote(
		userId: string,
		topicId: string,
		input: NoteFields
	): Promise<Note | undefined>;
	// The full text of a PDF, saved out of the notes list in page order; all or
	// none. When the same file was saved on the topic in the meantime (sent twice
	// at once), that text is given back instead, with reused set. Undefined when
	// the topic was deleted since it was checked
	savePdfText(
		userId: string,
		topicId: string,
		parts: NoteFields[],
		source: NoteSource
	): Promise<{ textIds: string[]; reused: boolean } | undefined>;
	// the saved text of a PDF with this hash on the topic, in page order
	findPdfText(
		userId: string,
		topicId: string,
		sourceHash: string
	): Promise<PdfText | undefined>;
	// the notes the student sees that were written from this PDF, in order
	listPdfNotes(
		userId: string,
		topicId: string,
		sourceHash: string
	): Promise<Note[]>;
	// The key points written from a PDF, all or none, in the order given. Notes of
	// the same PDF saved in the meantime are given back instead. Undefined when the
	// topic was deleted since it was checked
	insertPdfNotes(
		userId: string,
		topicId: string,
		inputs: NoteFields[],
		source: NoteSource
	): Promise<Note[] | undefined>;
	// PDFs Orbi has read on the topic that have no notes yet (attached in the chat,
	// or their key points were cancelled), newest first
	listUnwrittenPdfs(userId: string, topicId: string): Promise<SavedPdf[]>;
	// false when the topic has no text of this PDF
	deletePdfText(
		userId: string,
		topicId: string,
		sourceHash: string
	): Promise<boolean>;
	updateNote(
		userId: string,
		topicId: string,
		noteId: string,
		input: NoteFields
	): Promise<Note | undefined>;
	// false when nothing of this user matched; the last note of a PDF takes the
	// PDF's hidden text with it, so the tutor does not read a file the student removed
	deleteNote(userId: string, topicId: string, noteId: string): Promise<boolean>;
}

export type NoteFields = { title: string; content: string };

// the PDF a note was taken from
export type NoteSource = { name: string; hash: string };

export type PdfText = { name: string; ids: string[]; parts: string[] };

export type SavedPdf = { fileHash: string; name: string; savedAt: Date };

const NOTE_TOPIC_FK = 'note_topic_fk';

const noteColumns = {
	id: note.id,
	topicId: note.topicId,
	title: note.title,
	content: note.content,
	sourceName: note.sourceName,
	createdAt: note.createdAt,
	updatedAt: note.updatedAt,
};

type NoteRow = Omit<Note, 'createdAt' | 'updatedAt'> & {
	createdAt: Date;
	updatedAt: Date;
};

const isNote = eq(note.kind, 'note');
const isPdfText = eq(note.kind, 'pdf_text');

const onTopic = (userId: string, topicId: string) =>
	and(eq(note.userId, userId), eq(note.topicId, topicId));

// a hidden PDF text part is never changed or deleted by its id
const ownNote = (userId: string, topicId: string, noteId: string) =>
	and(onTopic(userId, topicId), eq(note.id, noteId), isNote);

const fromPdf = (userId: string, topicId: string, sourceHash: string) =>
	and(onTopic(userId, topicId), eq(note.sourceHash, sourceHash));

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

// one save of the same file on a topic at a time; the second waits here, then
// finds what the first one saved. The lock ends with the transaction.
const lockFile = (tx: Db, topicId: string, sourceHash: string, use: string) =>
	tx.execute(
		sql`select pg_advisory_xact_lock(hashtextextended(${`${topicId}:${sourceHash}:${use}`}, 0))`
	);

// Rows of one save are listed newest first, so each one is saved a millisecond
// newer than the next, and the first one ends up on top.
const inOrder = (count: number) => {
	const now = Date.now();
	return Array.from({ length: count }, (_, index) => new Date(now - index));
};

async function findPdfNotes(
	db: Db,
	userId: string,
	topicId: string,
	sourceHash: string
) {
	const rows = await db
		.select(noteColumns)
		.from(note)
		.where(and(fromPdf(userId, topicId, sourceHash), isNote))
		.orderBy(desc(note.createdAt), desc(note.id));
	return rows.map(toApi);
}

async function findTextIds(
	db: Db,
	userId: string,
	topicId: string,
	sourceHash: string
) {
	const rows = await db
		.select({ id: note.id })
		.from(note)
		.where(and(fromPdf(userId, topicId, sourceHash), isPdfText))
		.orderBy(desc(note.createdAt), desc(note.id));
	return rows.map(({ id }) => id);
}

async function insertRows(
	tx: Db,
	userId: string,
	topicId: string,
	inputs: NoteFields[],
	source: NoteSource,
	kind: 'note' | 'pdf_text'
) {
	const times = inOrder(inputs.length);
	return tx
		.insert(note)
		.values(
			inputs.map((input, index) => ({
				userId,
				topicId,
				...input,
				kind,
				sourceName: source.name,
				sourceHash: source.hash,
				createdAt: times[index],
				updatedAt: times[index],
			}))
		)
		.returning(noteColumns);
}

// a note left over with this condition keeps the PDF's text
async function hasOther(db: Db, where: SQL | undefined) {
	const [found] = await db.select({ id: note.id }).from(note).where(where);
	return found !== undefined;
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
				.where(and(onTopic(userId, topicId), isNote))
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

		// an insert that fails rolls the whole transaction back, so no part of the
		// PDF is left behind
		savePdfText: (userId, topicId, parts, source) =>
			unlessTopicGone(
				db.transaction(async (tx) => {
					await lockFile(tx, topicId, source.hash, 'text');
					const saved = await findTextIds(tx, userId, topicId, source.hash);
					if (saved.length > 0) return { textIds: saved, reused: true };
					const created = await insertRows(
						tx,
						userId,
						topicId,
						parts,
						source,
						'pdf_text'
					);
					return { textIds: created.map(({ id }) => id), reused: false };
				})
			),

		async findPdfText(userId, topicId, sourceHash) {
			const rows = await db
				.select({ id: note.id, name: note.sourceName, content: note.content })
				.from(note)
				.where(and(fromPdf(userId, topicId, sourceHash), isPdfText))
				// saved newest first, so the first page is the newest
				.orderBy(desc(note.createdAt), asc(note.id));
			if (rows.length === 0) return undefined;
			return {
				name: rows[0]!.name ?? 'PDF',
				ids: rows.map(({ id }) => id),
				parts: rows.map(({ content }) => content),
			};
		},

		listPdfNotes: (userId, topicId, sourceHash) =>
			findPdfNotes(db, userId, topicId, sourceHash),

		insertPdfNotes: (userId, topicId, inputs, source) =>
			unlessTopicGone(
				db.transaction(async (tx) => {
					await lockFile(tx, topicId, source.hash, 'notes');
					const saved = await findPdfNotes(tx, userId, topicId, source.hash);
					if (saved.length > 0) return saved;
					const created = await insertRows(
						tx,
						userId,
						topicId,
						inputs,
						source,
						'note'
					);
					return created.map(toApi);
				})
			),

		async listUnwrittenPdfs(userId, topicId) {
			const written = db
				.select({ hash: note.sourceHash })
				.from(note)
				// a hand-written note has no hash, and a null would make "not in" match nothing
				.where(
					and(onTopic(userId, topicId), isNote, isNotNull(note.sourceHash))
				);
			const rows = await db
				.select({
					fileHash: sql<string>`${note.sourceHash}`,
					name: sql<string>`min(${note.sourceName})`,
					savedAt: sql<Date>`max(${note.createdAt})`.mapWith(note.createdAt),
				})
				.from(note)
				.where(
					and(
						onTopic(userId, topicId),
						isPdfText,
						sql`${note.sourceHash} not in (${written})`
					)
				)
				.groupBy(note.sourceHash)
				.orderBy(sql`max(${note.createdAt}) desc`);
			return rows;
		},

		async deletePdfText(userId, topicId, sourceHash) {
			const deleted = await db
				.delete(note)
				.where(and(fromPdf(userId, topicId, sourceHash), isPdfText))
				.returning({ id: note.id });
			return deleted.length > 0;
		},

		async updateNote(userId, topicId, noteId, input) {
			const [updated] = await db
				.update(note)
				.set(input)
				.where(ownNote(userId, topicId, noteId))
				.returning(noteColumns);
			return updated && toApi(updated);
		},

		deleteNote: (userId, topicId, noteId) =>
			db.transaction(async (tx) => {
				const [deleted] = await tx
					.delete(note)
					.where(ownNote(userId, topicId, noteId))
					.returning({ sourceHash: note.sourceHash });
				if (!deleted) return false;
				const { sourceHash } = deleted;
				if (
					sourceHash &&
					!(await hasOther(
						tx,
						and(fromPdf(userId, topicId, sourceHash), isNote)
					))
				) {
					await tx
						.delete(note)
						.where(and(fromPdf(userId, topicId, sourceHash), isPdfText));
				}
				return true;
			}),
	};
}

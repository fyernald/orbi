import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';
import { course, topic, user } from '../../db/schema';
import { createTestDb } from '../../db/testing';
import { createNoteRepository, type NoteRepository } from './repository';

// a topic deleted after the service checked it is the same as one that never
// existed for the insert, so these tests use a topic id that is not there
let db: Awaited<ReturnType<typeof createTestDb>>;
let repo: NoteRepository;
let topicId: string;

beforeAll(async () => {
	db = await createTestDb();
	repo = createNoteRepository(db);
	await db
		.insert(user)
		.values({ id: 'ada', name: 'Ada', email: 'ada@test.dev' });
	const [created] = await db
		.insert(course)
		.values({ userId: 'ada', name: 'Biology', color: 'blue', goal: 'keep_up' })
		.returning({ id: course.id });
	const [cells] = await db
		.insert(topic)
		.values({ userId: 'ada', courseId: created!.id, name: 'Cells' })
		.returning({ id: topic.id });
	topicId = cells!.id;
});

const fields = { title: 'Mitosis', content: 'Prophase' };
const source = { name: 'cells.pdf', hash: 'a'.repeat(64) };

describe('note repository', () => {
	it('saves a note on a topic that is there', async () => {
		const created = await repo.insertNote('ada', topicId, fields);

		expect(created).toMatchObject({ topicId, ...fields });
	});

	it('gives back undefined for a note on a topic that is gone', async () => {
		await expect(
			repo.insertNote('ada', randomUUID(), fields)
		).resolves.toBeUndefined();
	});

	it('gives back undefined for PDF notes on a topic that is gone', async () => {
		await expect(
			repo.insertSourceNotes('ada', randomUUID(), [fields, fields], source)
		).resolves.toBeUndefined();
	});

	it('still throws other database errors', async () => {
		// the content must hold at least one character that is not a space
		await expect(
			repo.insertNote('ada', topicId, { title: 'Empty', content: '   ' })
		).rejects.toThrow();
	});
});

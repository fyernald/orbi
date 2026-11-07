import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import {
	course,
	note,
	profile,
	question,
	reviewItem,
	topic,
	user,
} from './schema';
import { createTestDb } from './testing';

let db: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
	db = await createTestDb();
});

let count = 0;

async function createUser() {
	count += 1;
	const [row] = await db
		.insert(user)
		.values({ id: `user-${count}`, name: 'Test', email: `${count}@test.dev` })
		.returning();
	return row!;
}

async function createNote(userId: string) {
	const [c] = await db
		.insert(course)
		.values({ userId, name: 'Biology' })
		.returning();
	const [t] = await db
		.insert(topic)
		.values({ userId, courseId: c!.id, name: 'Cells' })
		.returning();
	const [n] = await db
		.insert(note)
		.values({ userId, topicId: t!.id, title: 'Mitosis', content: 'Phases' })
		.returning();
	return { course: c!, topic: t!, note: n! };
}

async function createQuestion(userId: string) {
	const data = await createNote(userId);
	const [q] = await db
		.insert(question)
		.values({
			userId,
			topicId: data.topic.id,
			text: 'What splits in anaphase?',
			choices: ['Chromatids', 'Nuclei'],
			correctChoice: 0,
			source: 'manual',
		})
		.returning();
	return { ...data, question: q! };
}

const dueAt = new Date('2026-11-06T09:00:00Z');

// the Postgres error code, for example 23503 for a broken foreign key
async function errorCode(query: Promise<unknown>) {
	const error = await query.then(
		() => undefined,
		(e: unknown) => e
	);
	return (error as { cause?: { code?: string } } | undefined)?.cause?.code;
}

describe('database schema', () => {
	it('deletes all data of a user together with the user', async () => {
		const owner = await createUser();
		await db.insert(profile).values({ userId: owner.id });
		await createNote(owner.id);

		await db.delete(user).where(eq(user.id, owner.id));

		for (const table of [profile, course, topic, note]) {
			const rows = await db
				.select()
				.from(table)
				.where(eq(table.userId, owner.id));
			expect(rows).toHaveLength(0);
		}
	});

	it('deletes the topics and notes of a deleted course', async () => {
		const owner = await createUser();
		const data = await createNote(owner.id);

		await db.delete(course).where(eq(course.id, data.course.id));

		expect(
			await db.select().from(topic).where(eq(topic.userId, owner.id))
		).toHaveLength(0);
		expect(
			await db.select().from(note).where(eq(note.userId, owner.id))
		).toHaveLength(0);
	});

	it("does not allow a topic in another user's course", async () => {
		const owner = await createUser();
		const other = await createUser();
		const data = await createNote(owner.id);

		const query = db
			.insert(topic)
			.values({ userId: other.id, courseId: data.course.id, name: 'Stolen' });

		expect(await errorCode(query)).toBe('23503');
	});

	it("does not allow a note in another user's topic", async () => {
		const owner = await createUser();
		const other = await createUser();
		const data = await createNote(owner.id);

		const query = db.insert(note).values({
			userId: other.id,
			topicId: data.topic.id,
			title: 'Stolen',
			content: 'Text',
		});

		expect(await errorCode(query)).toBe('23503');
	});

	it('does not allow an empty note', async () => {
		const owner = await createUser();
		const data = await createNote(owner.id);

		const query = db.insert(note).values({
			userId: owner.id,
			topicId: data.topic.id,
			title: 'Empty',
			content: '  \n ',
		});

		expect(await errorCode(query)).toBe('23514');
	});

	it('allows only one profile per user', async () => {
		const owner = await createUser();
		await db.insert(profile).values({ userId: owner.id });

		const query = db.insert(profile).values({ userId: owner.id });

		expect(await errorCode(query)).toBe('23505');
	});

	it('starts a review item with the SM-2 defaults', async () => {
		const owner = await createUser();
		const data = await createQuestion(owner.id);

		const [row] = await db
			.insert(reviewItem)
			.values({ userId: owner.id, questionId: data.question.id, dueAt })
			.returning();

		expect(row).toMatchObject({
			repetitions: 0,
			intervalDays: 0,
			ease: 2.5,
			dueAt,
		});
	});

	it('deletes the review item of a deleted question', async () => {
		const owner = await createUser();
		const data = await createQuestion(owner.id);
		await db
			.insert(reviewItem)
			.values({ userId: owner.id, questionId: data.question.id, dueAt });

		await db.delete(topic).where(eq(topic.id, data.topic.id));

		expect(
			await db.select().from(reviewItem).where(eq(reviewItem.userId, owner.id))
		).toHaveLength(0);
	});

	it('allows one review item per question', async () => {
		const owner = await createUser();
		const data = await createQuestion(owner.id);
		const values = { userId: owner.id, questionId: data.question.id, dueAt };
		await db.insert(reviewItem).values(values);

		expect(await errorCode(db.insert(reviewItem).values(values))).toBe('23505');
	});

	it("does not allow a review item for another user's question", async () => {
		const owner = await createUser();
		const other = await createUser();
		const data = await createQuestion(owner.id);

		const query = db
			.insert(reviewItem)
			.values({ userId: other.id, questionId: data.question.id, dueAt });

		expect(await errorCode(query)).toBe('23503');
	});

	it('does not allow an ease below 1.3', async () => {
		const owner = await createUser();
		const data = await createQuestion(owner.id);

		const query = db.insert(reviewItem).values({
			userId: owner.id,
			questionId: data.question.id,
			dueAt,
			ease: 1.2,
		});

		expect(await errorCode(query)).toBe('23514');
	});
});

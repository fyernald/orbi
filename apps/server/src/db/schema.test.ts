import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { beforeAll, describe, expect, it } from 'vitest';
import * as schema from './schema';

const { user, profile, course, topic, note } = schema;

// an in-memory Postgres, so the tests run the real migrations without a database server
const db = drizzle({ client: new PGlite(), schema });

beforeAll(async () => {
	await migrate(db, {
		migrationsFolder: fileURLToPath(new URL('../../drizzle', import.meta.url)),
	});
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
});

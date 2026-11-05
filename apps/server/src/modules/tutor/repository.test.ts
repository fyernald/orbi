import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { note } from '../../db/schema';
import { createTestDb } from '../../db/testing';
import { createMemoryMailer } from '../../mail/testing';
import { createTestApp, signUpTestUser } from '../../testing';
import { createTutorRepository, type TutorRepository } from './repository';

let db: Awaited<ReturnType<typeof createTestDb>>;
let app: Awaited<ReturnType<typeof createTestApp>>;
let repo: TutorRepository;
let userId: string;
let courseId: string;
let mitosis: string;
let meiosis: string;
// note ids by title
const notes: Record<string, string> = {};

const send = (
	cookie: string,
	method: 'GET' | 'POST',
	url: string,
	payload?: object
) => app.inject({ method, url, headers: { cookie }, payload });

// n1 is the oldest; each note is 40,000 characters of its own letter
beforeAll(async () => {
	db = await createTestDb();
	app = await createTestApp(createMemoryMailer(), {
		requireEmailVerification: false,
		db,
	});
	repo = createTutorRepository(db);
	const ada = await signUpTestUser(app, 'ada@test.dev');
	userId = (await send(ada, 'GET', '/api/auth/get-session')).json().user.id;
	courseId = (
		await send(ada, 'POST', '/api/courses', {
			name: 'Biology 101',
			color: 'teal',
			goal: 'exam_prep',
			topics: ['Mitosis', 'Meiosis'],
		})
	).json().id;
	[mitosis, meiosis] = (
		await send(ada, 'GET', `/api/courses/${courseId}/topics`)
	)
		.json()
		.map(({ id }: { id: string }) => id);

	const notesIn = {
		n1: mitosis,
		n2: mitosis,
		n3: mitosis,
		n4: mitosis,
		m1: meiosis,
	};
	for (const [index, [title, topicId]] of Object.entries(notesIn).entries()) {
		const saved = await send(
			ada,
			'POST',
			`/api/courses/${courseId}/topics/${topicId}/notes`,
			{ title, content: 'abcde'[index]!.repeat(40_000) }
		);
		notes[title] = saved.json().id;
		await db
			.update(note)
			.set({ createdAt: new Date(Date.UTC(2026, 10, 1, index)) })
			.where(eq(note.id, notes[title]!));
	}
});

afterAll(async () => {
	await app.close();
});

const read = (attachedIds: string[] = [], maxLength = 100_000) =>
	repo.listNotesForReply(
		userId,
		{ topicId: mitosis },
		{ maxLength, attachedIds }
	);

const lengths = (loaded: Awaited<ReturnType<typeof read>>) =>
	Object.fromEntries(
		loaded.notes.map(({ title, content }) => [title, content.length])
	);

describe('listNotesForReply', () => {
	it('loads the newest notes until the limit, and counts them all', async () => {
		const loaded = await read();

		expect(loaded.notes.map(({ title }) => title)).toEqual(['n4', 'n3', 'n2']);
		expect(lengths(loaded)).toEqual({ n4: 40_000, n3: 40_000, n2: 20_000 });
		expect(loaded.total).toBe(4);
	});

	it('loads attached notes in the order given, besides the newest others', async () => {
		const loaded = await read([notes.n1!]);

		expect(lengths(loaded)).toEqual({
			n4: 40_000,
			n3: 40_000,
			n2: 20_000,
			n1: 40_000,
		});
		expect(loaded.total).toBe(4);
	});

	it('keeps attached notes that do not fit as titles only', async () => {
		const loaded = await read([notes.n2!, notes.n1!, notes.n4!], 50_000);

		expect(lengths(loaded)).toEqual({
			n4: 0,
			n3: 40_000,
			n2: 40_000,
			n1: 10_000,
		});
	});

	it('reads every topic of the course for the whole-course chat', async () => {
		const loaded = await repo.listNotesForReply(
			userId,
			{ courseId },
			{ maxLength: 100_000, attachedIds: [] }
		);

		expect(
			loaded.notes.map(({ title, topicName }) => [title, topicName])
		).toEqual([
			['m1', 'Meiosis'],
			['n4', 'Mitosis'],
			['n3', 'Mitosis'],
		]);
		expect(loaded.total).toBe(5);
	});

	it('gives nothing to another student', async () => {
		const loaded = await repo.listNotesForReply(
			'someone-else',
			{ topicId: mitosis },
			{ maxLength: 100_000, attachedIds: [notes.n1!] }
		);

		expect(loaded).toEqual({ notes: [], total: 0 });
	});
});

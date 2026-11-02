import { NOTE_CONTENT_MAX_LENGTH } from '@orbi/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryMailer } from '../../mail/testing';
import { createTestApp, signUpTestUser } from '../../testing';

let app: Awaited<ReturnType<typeof createTestApp>>;
let ada: string;
let grace: string;

beforeAll(async () => {
	app = await createTestApp(createMemoryMailer(), {
		requireEmailVerification: false,
	});
	ada = await signUpTestUser(app, 'ada@test.dev');
	grace = await signUpTestUser(app, 'grace@test.dev');
});

afterAll(async () => {
	await app.close();
});

const send = (
	cookie: string,
	method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
	url: string,
	payload?: object
) => app.inject({ method, url, headers: { cookie }, payload });

// a course of the user with one topic, and the url of that topic's notes
async function createTopic(cookie: string) {
	const course = (
		await send(cookie, 'POST', '/api/courses', {
			name: 'Biology 101',
			color: 'teal',
			goal: 'exam_prep',
			topics: ['Cells'],
		})
	).json();
	const [topic] = (
		await send(cookie, 'GET', `/api/courses/${course.id}/topics`)
	).json();
	return {
		courseId: course.id as string,
		topicId: topic.id as string,
		notesUrl: `/api/courses/${course.id}/topics/${topic.id}/notes`,
	};
}

describe('notes', () => {
	it('saves a note and lists it again', async () => {
		const { notesUrl } = await createTopic(ada);

		const response = await send(ada, 'POST', notesUrl, {
			title: ' Mitosis ',
			content: 'Prophase\n\n  Metaphase',
		});

		expect(response.statusCode).toBe(201);
		const created = response.json();
		expect(created).toEqual({
			id: expect.any(String),
			topicId: expect.any(String),
			title: 'Mitosis',
			// kept as pasted
			content: 'Prophase\n\n  Metaphase',
			createdAt: expect.any(String),
			updatedAt: expect.any(String),
		});
		expect((await send(ada, 'GET', notesUrl)).json()).toEqual([created]);
	});

	it('names a note without a title after its first line', async () => {
		const { notesUrl } = await createTopic(ada);

		const response = await send(ada, 'POST', notesUrl, {
			content: '\n  Cell cycle  \nG1, S, G2, M',
		});

		expect(response.json().title).toBe('Cell cycle');
	});

	it('lists the newest note first', async () => {
		const { notesUrl } = await createTopic(ada);
		await send(ada, 'POST', notesUrl, { content: 'First' });
		await send(ada, 'POST', notesUrl, { content: 'Second' });

		const titles = (await send(ada, 'GET', notesUrl))
			.json()
			.map((n: { title: string }) => n.title);

		expect(titles).toEqual(['Second', 'First']);
	});

	it('counts the note on its topic and course', async () => {
		const { courseId, notesUrl } = await createTopic(ada);
		await send(ada, 'POST', notesUrl, { content: 'Ribosomes' });

		const course = (await send(ada, 'GET', `/api/courses/${courseId}`)).json();
		const [topic] = (
			await send(ada, 'GET', `/api/courses/${courseId}/topics`)
		).json();

		expect(course.noteCount).toBe(1);
		expect(topic.noteCount).toBe(1);
	});

	it.each([
		['empty', ''],
		['only spaces and line breaks', '  \n\t \n'],
	])('rejects a note that is %s, with a clear message', async (_, content) => {
		const { notesUrl } = await createTopic(ada);

		const response = await send(ada, 'POST', notesUrl, { content });

		expect(response.statusCode).toBe(400);
		expect(response.json().error.message).toBe(
			'Add some notes first. Empty notes cannot be saved.'
		);
		expect((await send(ada, 'GET', notesUrl)).json()).toEqual([]);
	});

	it('rejects a note that is too long', async () => {
		const { notesUrl } = await createTopic(ada);

		const response = await send(ada, 'POST', notesUrl, {
			content: 'a'.repeat(NOTE_CONTENT_MAX_LENGTH + 1),
		});

		expect(response.statusCode).toBe(400);
	});

	it('answers 404 for a topic of another course', async () => {
		const first = await createTopic(ada);
		const second = await createTopic(ada);
		const url = `/api/courses/${first.courseId}/topics/${second.topicId}/notes`;

		expect((await send(ada, 'GET', url)).statusCode).toBe(404);
		expect((await send(ada, 'POST', url, { content: 'Lost' })).statusCode).toBe(
			404
		);
	});

	it('needs a logged-in user', async () => {
		const { notesUrl } = await createTopic(ada);

		const response = await app.inject({ method: 'GET', url: notesUrl });

		expect(response.statusCode).toBe(401);
	});
});

// a topic with one saved note, and the url of that note
async function createNote(cookie: string, payload: object) {
	const topic = await createTopic(cookie);
	const saved = (await send(cookie, 'POST', topic.notesUrl, payload)).json();
	return {
		...topic,
		noteId: saved.id as string,
		noteUrl: `${topic.notesUrl}/${saved.id}`,
	};
}

describe('editing a note', () => {
	it('saves the new title and text', async () => {
		const { notesUrl, noteUrl } = await createNote(ada, { content: 'Cells' });

		const response = await send(ada, 'PATCH', noteUrl, {
			title: 'Cell parts',
			content: 'Nucleus\nRibosomes',
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({
			title: 'Cell parts',
			content: 'Nucleus\nRibosomes',
		});
		const [saved] = (await send(ada, 'GET', notesUrl)).json();
		expect(saved.content).toBe('Nucleus\nRibosomes');
		expect(Date.parse(saved.updatedAt)).toBeGreaterThanOrEqual(
			Date.parse(saved.createdAt)
		);
	});

	it('names the note after its first line when the title is cleared', async () => {
		const { noteUrl } = await createNote(ada, {
			title: 'Old title',
			content: 'Old text',
		});

		const response = await send(ada, 'PATCH', noteUrl, {
			title: '',
			content: '\n  Mitochondria make energy\nMore',
		});

		expect(response.json().title).toBe('Mitochondria make energy');
	});

	it('rejects empty text', async () => {
		const { noteUrl } = await createNote(ada, { content: 'Keep me' });

		const response = await send(ada, 'PATCH', noteUrl, { content: '  ' });

		expect(response.statusCode).toBe(400);
	});

	it('answers 404 for a note of another topic', async () => {
		const first = await createNote(ada, { content: 'First' });
		const second = await createTopic(ada);
		const url = `${second.notesUrl}/${first.noteId}`;

		const response = await send(ada, 'PATCH', url, { content: 'Moved' });

		expect(response.statusCode).toBe(404);
		expect(response.json().error.message).toBe('Note not found.');
	});
});

describe('deleting a note', () => {
	it('deletes it and counts one note less', async () => {
		const { courseId, notesUrl, noteUrl } = await createNote(ada, {
			content: 'Gone soon',
		});

		const response = await send(ada, 'DELETE', noteUrl);

		expect(response.statusCode).toBe(204);
		expect((await send(ada, 'GET', notesUrl)).json()).toEqual([]);
		const course = (await send(ada, 'GET', `/api/courses/${courseId}`)).json();
		expect(course.noteCount).toBe(0);
	});

	it('answers 404 the second time', async () => {
		const { noteUrl } = await createNote(ada, { content: 'Once' });
		await send(ada, 'DELETE', noteUrl);

		const response = await send(ada, 'DELETE', noteUrl);

		expect(response.statusCode).toBe(404);
	});
});

describe("another user's notes", () => {
	it('answer like a topic that does not exist', async () => {
		const { notesUrl, noteUrl } = await createNote(ada, {
			content: 'Private',
		});

		const list = await send(grace, 'GET', notesUrl);
		const add = await send(grace, 'POST', notesUrl, { content: 'Sneaky' });
		const edit = await send(grace, 'PATCH', noteUrl, { content: 'Sneaky' });
		const remove = await send(grace, 'DELETE', noteUrl);

		expect([
			list.statusCode,
			add.statusCode,
			edit.statusCode,
			remove.statusCode,
		]).toEqual([404, 404, 404, 404]);
		const own = (await send(ada, 'GET', notesUrl)).json();
		expect(own).toEqual([expect.objectContaining({ content: 'Private' })]);
	});
});

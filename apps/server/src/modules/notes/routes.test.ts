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
	method: 'GET' | 'POST',
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

describe("another user's notes", () => {
	it('answer like a topic that does not exist', async () => {
		const { notesUrl } = await createTopic(ada);
		await send(ada, 'POST', notesUrl, { content: 'Private' });

		const list = await send(grace, 'GET', notesUrl);
		const add = await send(grace, 'POST', notesUrl, { content: 'Sneaky' });

		expect(list.statusCode).toBe(404);
		expect(add.statusCode).toBe(404);
		expect((await send(ada, 'GET', notesUrl)).json()).toHaveLength(1);
	});
});

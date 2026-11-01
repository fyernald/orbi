import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { question } from '../../db/schema';
import { createTestDb } from '../../db/testing';
import { createMemoryMailer } from '../../mail/testing';
import { createTestApp, signUpTestUser } from '../../testing';
import { createTutorRepository } from '../tutor/repository';

let app: Awaited<ReturnType<typeof createTestApp>>;
let db: Awaited<ReturnType<typeof createTestDb>>;
let ada: string;
let grace: string;

beforeAll(async () => {
	db = await createTestDb();
	app = await createTestApp(createMemoryMailer(), {
		requireEmailVerification: false,
		db,
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

const newCourse = (fields: object = {}) => ({
	name: 'Biology 101',
	color: 'teal',
	goal: 'exam_prep',
	topics: [],
	...fields,
});

const createCourse = async (cookie: string, name: string) =>
	(await send(cookie, 'POST', '/api/courses', newCourse({ name }))).json();

const userIdOf = async (cookie: string) =>
	(await send(cookie, 'GET', '/api/auth/get-session')).json().user.id as string;

// a course with one topic that has a note and a question
async function createFilledCourse(cookie: string) {
	const course = (
		await send(
			cookie,
			'POST',
			'/api/courses',
			newCourse({ name: 'Genetics', topics: ['DNA'] })
		)
	).json();
	const [topic] = (
		await send(cookie, 'GET', `/api/courses/${course.id}/topics`)
	).json();
	await send(
		cookie,
		'POST',
		`/api/courses/${course.id}/topics/${topic.id}/notes`,
		{ content: 'DNA is a double helix.' }
	);
	const [questionId] = await createTutorRepository(db).insertQuestions(
		await userIdOf(cookie),
		topic.id,
		[
			{
				text: 'What shape is DNA?',
				choices: ['A double helix', 'A ring'],
				correctChoice: 0,
				explanation: 'DNA is a double helix.',
				aiProvider: 'google',
				aiModel: 'gemini-test',
				chatMessageId: randomUUID(),
			},
		]
	);
	return {
		courseId: course.id as string,
		topicId: topic.id as string,
		questionId: questionId!,
	};
}

const questionExists = async (id: string) =>
	(await db.select().from(question).where(eq(question.id, id))).length > 0;

describe('courses', () => {
	it('creates a course and lists it', async () => {
		const response = await send(
			ada,
			'POST',
			'/api/courses',
			newCourse({ name: '  Biology 101 ', examDate: '2027-01-15' })
		);

		expect(response.statusCode).toBe(201);
		const created = response.json();
		expect(created).toEqual({
			id: expect.any(String),
			name: 'Biology 101',
			description: null,
			color: 'teal',
			goal: 'exam_prep',
			examDate: '2027-01-15',
			topicCount: 0,
			noteCount: 0,
			lastActivityAt: expect.any(String),
		});

		const list = await send(ada, 'GET', '/api/courses');
		expect(list.json()).toContainEqual(created);
	});

	it('saves the first topics with the course, in order', async () => {
		const response = await send(
			ada,
			'POST',
			'/api/courses',
			newCourse({ name: 'Genetics', topics: ['Mendel', ' DNA '] })
		);
		const { id, topicCount } = response.json();

		expect(topicCount).toBe(2);
		const topics = await send(ada, 'GET', `/api/courses/${id}/topics`);
		expect(
			topics
				.json()
				.map((t: { name: string; position: number }) => [t.name, t.position])
		).toEqual([
			['Mendel', 0],
			['DNA', 1],
		]);
		const course = await send(ada, 'GET', `/api/courses/${id}`);
		expect(course.json().topicCount).toBe(2);
	});

	it('saves nothing when a first topic is not valid', async () => {
		const user = await signUpTestUser(app, 'atomic@test.dev');
		const response = await send(
			user,
			'POST',
			'/api/courses',
			newCourse({ topics: ['Fine', ''] })
		);

		expect(response.statusCode).toBe(400);
		expect(response.json().error.message).toBe('Enter a topic name.');
		expect((await send(user, 'GET', '/api/courses')).json()).toEqual([]);
	});

	it('moves the last activity forward when a topic is added', async () => {
		const created = await createCourse(ada, 'Activity');
		await new Promise((resolve) => setTimeout(resolve, 5));
		await send(ada, 'POST', `/api/courses/${created.id}/topics`, {
			name: 'Fresh',
		});

		const course = (
			await send(ada, 'GET', `/api/courses/${created.id}`)
		).json();
		expect(Date.parse(course.lastActivityAt)).toBeGreaterThan(
			Date.parse(created.lastActivityAt)
		);
	});

	it('rejects an unknown colour', async () => {
		const response = await send(
			ada,
			'POST',
			'/api/courses',
			newCourse({ color: 'purple' })
		);

		expect(response.statusCode).toBe(400);
		expect(response.json().error.message).toBe('Choose a colour.');
	});

	it('lists courses in the order they were added', async () => {
		const user = await signUpTestUser(app, 'order@test.dev');
		await createCourse(user, 'First');
		await createCourse(user, 'Second');

		const list = await send(user, 'GET', '/api/courses');
		expect(list.json().map((c: { name: string }) => c.name)).toEqual([
			'First',
			'Second',
		]);
	});

	it('rejects a course without a name', async () => {
		const response = await send(
			ada,
			'POST',
			'/api/courses',
			newCourse({ name: '   ' })
		);

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: { code: 'validation_error', message: 'Enter a course name.' },
		});
	});

	it('needs a logged-in user', async () => {
		const response = await app.inject({ method: 'GET', url: '/api/courses' });

		expect(response.statusCode).toBe(401);
		expect(response.json().error.code).toBe('unauthorized');
	});
});

describe('topics', () => {
	it('adds topics to a course and lists them in order', async () => {
		const { id } = await createCourse(ada, 'Calculus II');
		const url = `/api/courses/${id}/topics`;

		const first = await send(ada, 'POST', url, { name: 'Limits' });
		await send(ada, 'POST', url, { name: 'Taylor series' });

		expect(first.statusCode).toBe(201);
		expect(first.json()).toEqual({
			id: expect.any(String),
			courseId: id,
			name: 'Limits',
			position: 0,
			noteCount: 0,
		});

		const list = await send(ada, 'GET', url);
		expect(
			list
				.json()
				.map((t: { name: string; position: number }) => [t.name, t.position])
		).toEqual([
			['Limits', 0],
			['Taylor series', 1],
		]);
	});

	it('answers 404 for a course that does not exist', async () => {
		const response = await send(
			ada,
			'GET',
			'/api/courses/00000000-0000-4000-8000-000000000000/topics'
		);

		expect(response.statusCode).toBe(404);
		expect(response.json().error.message).toBe('Course not found.');
	});

	it('rejects a course id that is not a uuid', async () => {
		const response = await send(ada, 'GET', '/api/courses/nope');

		expect(response.statusCode).toBe(400);
	});
});

describe('renaming', () => {
	it('renames a course and sends it back with its counts', async () => {
		const { courseId } = await createFilledCourse(ada);

		const response = await send(ada, 'PATCH', `/api/courses/${courseId}`, {
			name: '  Molecular genetics ',
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({
			id: courseId,
			name: 'Molecular genetics',
			topicCount: 1,
			noteCount: 1,
		});
		const saved = (await send(ada, 'GET', `/api/courses/${courseId}`)).json();
		expect(saved.name).toBe('Molecular genetics');
	});

	it('renames a topic and keeps its note count', async () => {
		const { courseId, topicId } = await createFilledCourse(ada);

		const response = await send(
			ada,
			'PATCH',
			`/api/courses/${courseId}/topics/${topicId}`,
			{ name: 'DNA and RNA' }
		);

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			id: topicId,
			courseId,
			name: 'DNA and RNA',
			position: 0,
			noteCount: 1,
		});
	});

	it('rejects an empty name', async () => {
		const { courseId, topicId } = await createFilledCourse(ada);

		const course = await send(ada, 'PATCH', `/api/courses/${courseId}`, {
			name: '   ',
		});
		const topic = await send(
			ada,
			'PATCH',
			`/api/courses/${courseId}/topics/${topicId}`,
			{ name: '' }
		);

		expect(course.statusCode).toBe(400);
		expect(course.json().error.message).toBe('Enter a course name.');
		expect(topic.statusCode).toBe(400);
		expect(topic.json().error.message).toBe('Enter a topic name.');
	});

	it('answers 404 for a topic of another course', async () => {
		const first = await createFilledCourse(ada);
		const second = await createFilledCourse(ada);

		const response = await send(
			ada,
			'PATCH',
			`/api/courses/${second.courseId}/topics/${first.topicId}`,
			{ name: 'Moved' }
		);

		expect(response.statusCode).toBe(404);
		expect(response.json().error.message).toBe('Topic not found.');
	});
});

describe('deleting', () => {
	it('deletes a topic and counts one topic less', async () => {
		const response = await send(
			ada,
			'POST',
			'/api/courses',
			newCourse({ name: 'Physics', topics: ['Motion', 'Energy'] })
		);
		const { id } = response.json();
		const topics = (await send(ada, 'GET', `/api/courses/${id}/topics`)).json();

		const deleted = await send(
			ada,
			'DELETE',
			`/api/courses/${id}/topics/${topics[0].id}`
		);

		expect(deleted.statusCode).toBe(204);
		const left = (await send(ada, 'GET', `/api/courses/${id}/topics`)).json();
		expect(left.map((t: { name: string }) => t.name)).toEqual(['Energy']);
		const course = (await send(ada, 'GET', `/api/courses/${id}`)).json();
		expect(course.topicCount).toBe(1);
	});

	it('deletes a course with its topics', async () => {
		const response = await send(
			ada,
			'POST',
			'/api/courses',
			newCourse({ name: 'Chemistry', topics: ['Atoms'] })
		);
		const { id } = response.json();

		const deleted = await send(ada, 'DELETE', `/api/courses/${id}`);

		expect(deleted.statusCode).toBe(204);
		expect((await send(ada, 'GET', `/api/courses/${id}`)).statusCode).toBe(404);
		const list = (await send(ada, 'GET', '/api/courses')).json();
		expect(list.some((c: { id: string }) => c.id === id)).toBe(false);
	});

	it('deletes the notes and questions of a deleted topic', async () => {
		const { courseId, topicId, questionId } = await createFilledCourse(ada);

		await send(ada, 'DELETE', `/api/courses/${courseId}/topics/${topicId}`);

		expect(await questionExists(questionId)).toBe(false);
		const course = (await send(ada, 'GET', `/api/courses/${courseId}`)).json();
		expect(course.noteCount).toBe(0);
	});

	it('deletes the topics, notes, and questions of a deleted course', async () => {
		const { courseId, topicId, questionId } = await createFilledCourse(ada);

		await send(ada, 'DELETE', `/api/courses/${courseId}`);

		expect(await questionExists(questionId)).toBe(false);
		const notes = await send(
			ada,
			'GET',
			`/api/courses/${courseId}/topics/${topicId}/notes`
		);
		expect(notes.statusCode).toBe(404);
	});

	it('answers 404 for a topic of another course', async () => {
		const first = await createCourse(ada, 'First course');
		const second = await createCourse(ada, 'Second course');
		const added = await send(ada, 'POST', `/api/courses/${first.id}/topics`, {
			name: 'Stays',
		});

		const deleted = await send(
			ada,
			'DELETE',
			`/api/courses/${second.id}/topics/${added.json().id}`
		);

		expect(deleted.statusCode).toBe(404);
		const topics = await send(ada, 'GET', `/api/courses/${first.id}/topics`);
		expect(topics.json()).toHaveLength(1);
	});
});

describe("another user's data", () => {
	it('is never listed', async () => {
		const own = await createCourse(ada, 'Private notes');

		const list = await send(grace, 'GET', '/api/courses');
		expect(list.json()).not.toContainEqual(own);
	});

	it('answers like a course that does not exist', async () => {
		const { id } = await createCourse(ada, 'Macroeconomics');
		const ownTopicId = (
			await send(ada, 'POST', `/api/courses/${id}/topics`, {
				name: 'Inflation',
			})
		).json().id;

		const course = await send(grace, 'GET', `/api/courses/${id}`);
		const topics = await send(grace, 'GET', `/api/courses/${id}/topics`);
		const added = await send(grace, 'POST', `/api/courses/${id}/topics`, {
			name: 'Sneaky',
		});

		const deletedTopic = await send(
			grace,
			'DELETE',
			`/api/courses/${id}/topics/${ownTopicId}`
		);
		const deletedCourse = await send(grace, 'DELETE', `/api/courses/${id}`);
		const renamedTopic = await send(
			grace,
			'PATCH',
			`/api/courses/${id}/topics/${ownTopicId}`,
			{ name: 'Taken' }
		);
		const renamedCourse = await send(grace, 'PATCH', `/api/courses/${id}`, {
			name: 'Taken',
		});

		expect([
			course.statusCode,
			topics.statusCode,
			added.statusCode,
			deletedTopic.statusCode,
			deletedCourse.statusCode,
			renamedTopic.statusCode,
			renamedCourse.statusCode,
		]).toEqual([404, 404, 404, 404, 404, 404, 404]);
		const own = await send(ada, 'GET', `/api/courses/${id}/topics`);
		expect(own.json()).toEqual([
			expect.objectContaining({ name: 'Inflation' }),
		]);
		const ownCourse = (await send(ada, 'GET', `/api/courses/${id}`)).json();
		expect(ownCourse.name).toBe('Macroeconomics');
	});
});

import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestDb } from '../../db/testing';
import { createMemoryMailer } from '../../mail/testing';
import { createTestApp, signUpTestUser } from '../../testing';
import { createTutorRepository } from '../tutor/repository';

let app: Awaited<ReturnType<typeof createTestApp>>;
let tutor: ReturnType<typeof createTutorRepository>;
let ada: string;
let grace: string;

beforeAll(async () => {
	const db = await createTestDb();
	tutor = createTutorRepository(db);
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

const userIdOf = async (cookie: string) =>
	(await send(cookie, 'GET', '/api/auth/get-session')).json().user.id as string;

// a new course of the user with one topic, and the url of that topic's questions
async function createTopic(cookie: string) {
	const course = (
		await send(cookie, 'POST', '/api/courses', {
			name: 'Biology 101',
			color: 'teal',
			goal: 'exam_prep',
			topics: ['Cell division'],
		})
	).json();
	const [topic] = (
		await send(cookie, 'GET', `/api/courses/${course.id}/topics`)
	).json();
	const base = `/api/courses/${course.id}/topics/${topic.id}`;
	return {
		courseId: course.id as string,
		topicId: topic.id as string,
		base,
		questions: `${base}/questions`,
	};
}

const mitosis = {
	text: 'Which phase lines the chromosomes up?',
	choices: ['Prophase', 'Metaphase', 'Anaphase'],
	correctChoice: 1,
	explanation: 'They line up in the middle in metaphase.',
};

describe('adding a question', () => {
	it('saves it approved, so it shows up in the study session', async () => {
		const { base, questions } = await createTopic(ada);

		const response = await send(ada, 'POST', questions, mitosis);

		expect(response.statusCode).toBe(201);
		const created = response.json();
		expect(created).toMatchObject({ ...mitosis, status: 'approved' });
		const session = (await send(ada, 'GET', `${base}/study`)).json();
		expect(session.questions).toEqual([
			{ id: created.id, text: mitosis.text, choices: mitosis.choices },
		]);
	});

	it('trims the text and saves an empty explanation as none', async () => {
		const { questions } = await createTopic(ada);

		const response = await send(ada, 'POST', questions, {
			text: '  What divides the cytoplasm?  ',
			choices: [' Cytokinesis ', 'Mitosis'],
			correctChoice: 0,
			explanation: '   ',
		});

		expect(response.json()).toMatchObject({
			text: 'What divides the cytoplasm?',
			choices: ['Cytokinesis', 'Mitosis'],
			explanation: null,
		});
	});

	it.each([
		[{ text: '  ' }, 'Write the question.'],
		[{ choices: ['Metaphase'], correctChoice: 0 }, 'Add at least 2 options.'],
		[{ choices: ['Prophase', ' '] }, 'Fill in this option.'],
		[
			{ choices: ['Metaphase', 'metaphase '] },
			'Each option must be different.',
		],
		[{ correctChoice: undefined }, 'Mark the correct option.'],
		[{ correctChoice: 3 }, 'Mark the correct option.'],
	])('says what is missing: %o', async (change, message) => {
		const { questions } = await createTopic(ada);

		const response = await send(ada, 'POST', questions, {
			...mitosis,
			...change,
		});

		expect(response.statusCode).toBe(400);
		expect(response.json().error.message).toBe(message);
	});

	it("cannot add to another user's topic", async () => {
		const { questions } = await createTopic(grace);

		const response = await send(ada, 'POST', questions, mitosis);

		expect(response.statusCode).toBe(404);
		expect(response.json().error.message).toBe('Topic not found.');
	});
});

describe("a topic's questions", () => {
	it('lists the kept and waiting ones, newest first, without the rejected', async () => {
		const { topicId, questions } = await createTopic(ada);
		const [waiting, rejected] = await tutor.insertQuestions(
			await userIdOf(ada),
			topicId,
			['Waiting for review', 'Rejected'].map((text) => ({
				...mitosis,
				text,
				choices: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
				aiProvider: 'google',
				aiModel: 'gemini-test',
				chatMessageId: randomUUID(),
			}))
		);
		await send(ada, 'PATCH', `/api/questions/${rejected}`, {
			status: 'rejected',
		});
		const added = (await send(ada, 'POST', questions, mitosis)).json();

		const listed = (await send(ada, 'GET', questions)).json();

		expect(listed.map(({ id }: { id: string }) => id)).toEqual([
			added.id,
			waiting,
		]);
		expect(listed[1].status).toBe('pending');
	});

	it("cannot list another user's topic", async () => {
		const { questions } = await createTopic(grace);

		expect((await send(ada, 'GET', questions)).statusCode).toBe(404);
	});
});

describe('editing a question', () => {
	it('saves the new text, options and answer', async () => {
		const { questions } = await createTopic(ada);
		const { id } = (await send(ada, 'POST', questions, mitosis)).json();
		const edited = {
			text: 'Which phase splits the sister chromatids?',
			choices: ['Metaphase', 'Anaphase', 'Telophase', 'Prophase'],
			correctChoice: 1,
			explanation: '',
		};

		const response = await send(ada, 'PATCH', `${questions}/${id}`, edited);

		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({
			...edited,
			explanation: null,
			status: 'approved',
		});
		expect((await send(ada, 'GET', questions)).json()[0].text).toBe(
			edited.text
		);
	});

	it('keeps a question that waits for review waiting', async () => {
		const { topicId, questions } = await createTopic(ada);
		const [waiting] = await tutor.insertQuestions(
			await userIdOf(ada),
			topicId,
			[
				{
					...mitosis,
					choices: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
					aiProvider: 'google',
					aiModel: 'gemini-test',
					chatMessageId: randomUUID(),
				},
			]
		);

		const response = await send(
			ada,
			'PATCH',
			`${questions}/${waiting}`,
			mitosis
		);

		expect(response.json().status).toBe('pending');
	});

	it('checks the edit the same way as a new question', async () => {
		const { questions } = await createTopic(ada);
		const { id } = (await send(ada, 'POST', questions, mitosis)).json();

		const response = await send(ada, 'PATCH', `${questions}/${id}`, {
			...mitosis,
			choices: ['Metaphase'],
			correctChoice: 0,
		});

		expect(response.statusCode).toBe(400);
		expect(response.json().error.message).toBe('Add at least 2 options.');
	});

	it("cannot edit another user's question, or one from another topic", async () => {
		const own = await createTopic(ada);
		const other = await createTopic(grace);
		const { id } = (await send(grace, 'POST', other.questions, mitosis)).json();
		const mine = (await send(ada, 'POST', own.questions, mitosis)).json();
		const second = await createTopic(ada);

		const responses = await Promise.all([
			send(ada, 'PATCH', `${other.questions}/${id}`, mitosis),
			send(ada, 'PATCH', `${own.questions}/${id}`, mitosis),
			send(ada, 'PATCH', `${second.questions}/${mine.id}`, mitosis),
		]);

		expect(responses.map(({ statusCode }) => statusCode)).toEqual([
			404, 404, 404,
		]);
		expect(responses[1]!.json().error.message).toBe('Question not found.');
	});
});

describe('deleting a question', () => {
	it('removes it from the topic and the study session', async () => {
		const { base, questions } = await createTopic(ada);
		const { id } = (await send(ada, 'POST', questions, mitosis)).json();
		await send(ada, 'POST', `/api/questions/${id}/session-answer`, {
			choice: 1,
		});

		const response = await send(ada, 'DELETE', `${questions}/${id}`);

		expect(response.statusCode).toBe(204);
		expect((await send(ada, 'GET', questions)).json()).toEqual([]);
		expect((await send(ada, 'GET', `${base}/study`)).json().questions).toEqual(
			[]
		);
	});

	it("cannot delete another user's question", async () => {
		const other = await createTopic(grace);
		const { id } = (await send(grace, 'POST', other.questions, mitosis)).json();

		const response = await send(ada, 'DELETE', `${other.questions}/${id}`);

		expect(response.statusCode).toBe(404);
		expect((await send(grace, 'GET', other.questions)).json()).toHaveLength(1);
	});

	it('answers 404 for a question that is already gone', async () => {
		const { questions } = await createTopic(ada);
		const { id } = (await send(ada, 'POST', questions, mitosis)).json();
		await send(ada, 'DELETE', `${questions}/${id}`);

		const response = await send(ada, 'DELETE', `${questions}/${id}`);

		expect(response.statusCode).toBe(404);
		expect(response.json().error.message).toBe('Question not found.');
	});
});

describe("a course's question sets", () => {
	const makeSet = async (topicId: string, texts: string[]) => {
		const setId = randomUUID();
		const ids = await tutor.insertQuestions(
			await userIdOf(ada),
			topicId,
			texts.map((text) => ({
				...mitosis,
				text,
				choices: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
				aiProvider: 'google',
				aiModel: 'gemini-test',
				chatMessageId: setId,
			}))
		);
		return { setId, ids };
	};

	it('lists each set the tutor made, newest first, without the rejected questions', async () => {
		const { courseId, topicId, questions } = await createTopic(ada);
		const older = await makeSet(topicId, ['One', 'Two', 'Three']);
		const newer = await makeSet(topicId, ['Four', 'Five']);
		await send(ada, 'PATCH', `/api/questions/${older.ids[0]}`, {
			status: 'rejected',
		});
		// one the student writes is not part of a set
		await send(ada, 'POST', questions, mitosis);

		const response = await send(
			ada,
			'GET',
			`/api/courses/${courseId}/question-sets`
		);

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual([
			expect.objectContaining({
				id: newer.setId,
				topicId,
				topicName: 'Cell division',
				questionCount: 2,
			}),
			expect.objectContaining({ id: older.setId, questionCount: 2 }),
		]);
	});

	it('says which set each question of the topic belongs to', async () => {
		const { topicId, questions } = await createTopic(ada);
		const { setId } = await makeSet(topicId, ['From the tutor']);
		await send(ada, 'POST', questions, mitosis);

		const listed = (await send(ada, 'GET', questions)).json();

		expect(listed.map(({ setId }: { setId: string | null }) => setId)).toEqual([
			null,
			setId,
		]);
	});

	it('leaves out a set whose questions were all rejected', async () => {
		const { courseId, topicId } = await createTopic(ada);
		const { ids } = await makeSet(topicId, ['Only one']);
		await send(ada, 'PATCH', `/api/questions/${ids[0]}`, {
			status: 'rejected',
		});

		const listed = (
			await send(ada, 'GET', `/api/courses/${courseId}/question-sets`)
		).json();

		expect(listed).toEqual([]);
	});

	it("cannot list another user's course", async () => {
		const { courseId } = await createTopic(grace);

		const response = await send(
			ada,
			'GET',
			`/api/courses/${courseId}/question-sets`
		);

		expect(response.statusCode).toBe(404);
	});
});

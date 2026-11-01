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
	method: 'GET' | 'POST' | 'PATCH',
	url: string,
	payload?: object
) => app.inject({ method, url, headers: { cookie }, payload });

const userIdOf = async (cookie: string) =>
	(await send(cookie, 'GET', '/api/auth/get-session')).json().user.id as string;

// a new course of the user with the given topics
async function createCourse(cookie: string, topics: string[]) {
	const course = (
		await send(cookie, 'POST', '/api/courses', {
			name: 'Biology 101',
			color: 'teal',
			goal: 'exam_prep',
			topics,
		})
	).json();
	const saved: { id: string; name: string }[] = (
		await send(cookie, 'GET', `/api/courses/${course.id}/topics`)
	).json();
	return { courseId: course.id as string, topicIds: saved.map(({ id }) => id) };
}

// saves pending questions the way the tutor does, and gives their ids
async function addQuestions(cookie: string, topicId: string, texts: string[]) {
	return tutor.insertQuestions(
		await userIdOf(cookie),
		topicId,
		texts.map((text) => ({
			text,
			choices: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
			correctChoice: 1,
			explanation: 'The chromosomes line up in metaphase.',
			aiProvider: 'google',
			aiModel: 'gemini-test',
			chatMessageId: randomUUID(),
		}))
	);
}

const review = async (cookie: string) =>
	(await send(cookie, 'GET', '/api/questions/review')).json();

const reviewIds = async (cookie: string): Promise<string[]> =>
	(await review(cookie)).flatMap((group: { questions: { id: string }[] }) =>
		group.questions.map(({ id }) => id)
	);

describe('questions for review', () => {
	it('lists the pending questions by topic, the newest topic first', async () => {
		const { courseId, topicIds } = await createCourse(ada, ['Cells', 'DNA']);
		const [cells, dna] = topicIds as [string, string];
		const cellIds = await addQuestions(ada, cells, ['Q1', 'Q2']);
		const dnaIds = await addQuestions(ada, dna, ['Q3']);

		const groups = await review(ada);

		const mine = groups.filter(
			(group: { courseId: string }) => group.courseId === courseId
		);
		expect(mine).toEqual([
			{
				courseId,
				courseName: 'Biology 101',
				courseColor: 'teal',
				topicId: dna,
				topicName: 'DNA',
				questions: [
					{
						id: dnaIds[0],
						topicId: dna,
						type: 'multiple_choice',
						text: 'Q3',
						choices: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
						correctChoice: 1,
						explanation: 'The chromosomes line up in metaphase.',
						status: 'pending',
						createdAt: expect.any(String),
					},
				],
			},
			expect.objectContaining({
				topicId: cells,
				topicName: 'Cells',
				questions: [
					expect.objectContaining({ id: cellIds[0] }),
					expect.objectContaining({ id: cellIds[1] }),
				],
			}),
		]);
	});

	it('does not list the questions of another user', async () => {
		const { topicIds } = await createCourse(grace, ['Cells']);
		const [graceId] = await addQuestions(grace, topicIds[0]!, ['Private']);

		expect(await reviewIds(ada)).not.toContain(graceId);
		expect(await reviewIds(grace)).toContain(graceId);
	});

	it('needs a login', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/api/questions/review',
		});
		expect(response.statusCode).toBe(401);
	});
});

describe('approving and rejecting', () => {
	it('approves a question, which then leaves the review list', async () => {
		const { topicIds } = await createCourse(ada, ['Cells']);
		const [id] = await addQuestions(ada, topicIds[0]!, ['Q']);

		const response = await send(ada, 'PATCH', `/api/questions/${id}`, {
			status: 'approved',
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({ id, status: 'approved' });
		expect(await reviewIds(ada)).not.toContain(id);
	});

	it('hides a rejected question, and an undo brings it back', async () => {
		const { topicIds } = await createCourse(ada, ['Cells']);
		const [id] = await addQuestions(ada, topicIds[0]!, ['Q']);

		await send(ada, 'PATCH', `/api/questions/${id}`, { status: 'rejected' });
		expect(await reviewIds(ada)).not.toContain(id);

		const undo = await send(ada, 'PATCH', `/api/questions/${id}`, {
			status: 'pending',
		});
		expect(undo.json()).toMatchObject({ id, status: 'pending' });
		expect(await reviewIds(ada)).toContain(id);
	});

	it("cannot change another user's question", async () => {
		const { topicIds } = await createCourse(grace, ['Cells']);
		const [id] = await addQuestions(grace, topicIds[0]!, ['Q']);

		const response = await send(ada, 'PATCH', `/api/questions/${id}`, {
			status: 'rejected',
		});

		expect(response.statusCode).toBe(404);
		expect(await reviewIds(grace)).toContain(id);
	});

	it('answers 404 for an unknown question and 400 for an unknown status', async () => {
		const unknown = await send(ada, 'PATCH', `/api/questions/${randomUUID()}`, {
			status: 'approved',
		});
		expect(unknown.statusCode).toBe(404);

		const { topicIds } = await createCourse(ada, ['Cells']);
		const [id] = await addQuestions(ada, topicIds[0]!, ['Q']);
		const wrong = await send(ada, 'PATCH', `/api/questions/${id}`, {
			status: 'maybe',
		});
		expect(wrong.statusCode).toBe(400);
	});
});

describe('approving a whole topic', () => {
	it('approves only the pending questions of that topic', async () => {
		const { courseId, topicIds } = await createCourse(ada, ['Cells', 'DNA']);
		const [cells, dna] = topicIds as [string, string];
		const [rejected, ...pending] = await addQuestions(ada, cells, [
			'Q1',
			'Q2',
			'Q3',
		]);
		await send(ada, 'PATCH', `/api/questions/${rejected}`, {
			status: 'rejected',
		});
		const [other] = await addQuestions(ada, dna, ['Q4']);

		const response = await send(
			ada,
			'POST',
			`/api/courses/${courseId}/topics/${cells}/questions/approve`
		);

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({ approved: pending.length });
		const left = await reviewIds(ada);
		expect(left).toContain(other);
		for (const id of [rejected, ...pending]) expect(left).not.toContain(id);
	});

	it("cannot approve another user's topic", async () => {
		const { courseId, topicIds } = await createCourse(grace, ['Cells']);
		const [id] = await addQuestions(grace, topicIds[0]!, ['Q']);

		const response = await send(
			ada,
			'POST',
			`/api/courses/${courseId}/topics/${topicIds[0]}/questions/approve`
		);

		expect(response.statusCode).toBe(404);
		expect(await reviewIds(grace)).toContain(id);
	});
});

describe('answering in the chat', () => {
	const answerIn = (cookie: string, id: string, choice: number) =>
		send(cookie, 'POST', `/api/questions/${id}/chat-answer`, { choice });
	const answersOf = async (cookie: string, ids: string[]) =>
		(
			await send(
				cookie,
				'GET',
				`/api/questions/chat-answers?ids=${ids.join(',')}`
			)
		).json();

	it('saves the first answer and says if it is right', async () => {
		const { topicIds } = await createCourse(ada, ['Cells']);
		const [right, wrong] = (await addQuestions(ada, topicIds[0]!, [
			'Q1',
			'Q2',
		])) as [string, string];

		const first = await answerIn(ada, right, 1);
		expect(first.statusCode).toBe(201);
		expect(first.json()).toEqual({
			questionId: right,
			choice: 1,
			correct: true,
		});
		expect((await answerIn(ada, wrong, 3)).json()).toMatchObject({
			correct: false,
		});

		expect(await answersOf(ada, [right, wrong])).toEqual(
			expect.arrayContaining([
				{ questionId: right, choice: 1, correct: true },
				{ questionId: wrong, choice: 3, correct: false },
			])
		);
	});

	it('takes only one answer per question', async () => {
		const { topicIds } = await createCourse(ada, ['Cells']);
		const [id] = (await addQuestions(ada, topicIds[0]!, ['Q'])) as [string];

		await answerIn(ada, id, 0);
		const again = await answerIn(ada, id, 1);

		expect(again.statusCode).toBe(409);
		expect(await answersOf(ada, [id])).toEqual([
			{ questionId: id, choice: 0, correct: false },
		]);
	});

	it('keeps the answer after the question is approved', async () => {
		const { topicIds } = await createCourse(ada, ['Cells']);
		const [id] = (await addQuestions(ada, topicIds[0]!, ['Q'])) as [string];
		await answerIn(ada, id, 1);

		await send(ada, 'PATCH', `/api/questions/${id}`, { status: 'approved' });

		expect(await answersOf(ada, [id])).toHaveLength(1);
	});

	it("cannot answer or read another user's question", async () => {
		const { topicIds } = await createCourse(grace, ['Cells']);
		const [id] = (await addQuestions(grace, topicIds[0]!, ['Q'])) as [string];
		await answerIn(grace, id, 1);

		expect((await answerIn(ada, id, 1)).statusCode).toBe(404);
		expect(await answersOf(ada, [id])).toEqual([]);
	});

	it('answers 400 for a choice that does not exist', async () => {
		const { topicIds } = await createCourse(ada, ['Cells']);
		const [id] = (await addQuestions(ada, topicIds[0]!, ['Q'])) as [string];

		expect((await answerIn(ada, id, 4)).statusCode).toBe(400);
		expect(await answersOf(ada, [id])).toEqual([]);
	});
});

describe('study sessions', () => {
	const study = (cookie: string, courseId: string, topicId: string) =>
		send(cookie, 'GET', `/api/courses/${courseId}/topics/${topicId}/study`);
	const answerIn = (cookie: string, id: string, choice: number) =>
		send(cookie, 'POST', `/api/questions/${id}/session-answer`, { choice });
	const approve = (cookie: string, id: string) =>
		send(cookie, 'PATCH', `/api/questions/${id}`, { status: 'approved' });

	it('lists only the approved questions, without their answers', async () => {
		const { courseId, topicIds } = await createCourse(ada, ['Cells']);
		const [first, second, pending] = (await addQuestions(ada, topicIds[0]!, [
			'Q1',
			'Q2',
			'Q3',
		])) as [string, string, string];
		await approve(ada, first);
		await approve(ada, second);

		const response = await study(ada, courseId, topicIds[0]!);

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			courseName: 'Biology 101',
			topicName: 'Cells',
			questions: [
				{ id: first, text: 'Q1', choices: expect.any(Array) },
				{ id: second, text: 'Q2', choices: expect.any(Array) },
			],
			pendingCount: 1,
		});
		expect(JSON.stringify(response.json())).not.toContain(pending);
	});

	it('gives an empty session for a topic with no approved questions', async () => {
		const { courseId, topicIds } = await createCourse(ada, ['Cells']);

		expect((await study(ada, courseId, topicIds[0]!)).json()).toMatchObject({
			questions: [],
			pendingCount: 0,
		});
	});

	it('checks each answer and saves every try', async () => {
		const { topicIds } = await createCourse(ada, ['Cells']);
		const [id] = (await addQuestions(ada, topicIds[0]!, ['Q'])) as [string];
		await approve(ada, id);

		const wrong = await answerIn(ada, id, 0);
		expect(wrong.statusCode).toBe(201);
		expect(wrong.json()).toEqual({
			questionId: id,
			choice: 0,
			correct: false,
			correctChoice: 1,
			explanation: 'The chromosomes line up in metaphase.',
		});
		const right = await answerIn(ada, id, 1);
		expect(right.statusCode).toBe(201);
		expect(right.json()).toMatchObject({ correct: true });
	});

	it('does not count a session answer as the chat answer', async () => {
		const { topicIds } = await createCourse(ada, ['Cells']);
		const [id] = (await addQuestions(ada, topicIds[0]!, ['Q'])) as [string];
		await approve(ada, id);
		await answerIn(ada, id, 1);

		const chat = await send(ada, 'POST', `/api/questions/${id}/chat-answer`, {
			choice: 0,
		});

		expect(chat.statusCode).toBe(201);
	});

	it('answers 409 for a question that is not approved', async () => {
		const { topicIds } = await createCourse(ada, ['Cells']);
		const [id] = (await addQuestions(ada, topicIds[0]!, ['Q'])) as [string];

		expect((await answerIn(ada, id, 1)).statusCode).toBe(409);
	});

	it('answers 400 for a choice that does not exist', async () => {
		const { topicIds } = await createCourse(ada, ['Cells']);
		const [id] = (await addQuestions(ada, topicIds[0]!, ['Q'])) as [string];
		await approve(ada, id);

		expect((await answerIn(ada, id, 4)).statusCode).toBe(400);
	});

	it("cannot study or answer another user's topic", async () => {
		const { courseId, topicIds } = await createCourse(grace, ['Cells']);
		const [id] = (await addQuestions(grace, topicIds[0]!, ['Q'])) as [string];
		await approve(grace, id);

		expect((await study(ada, courseId, topicIds[0]!)).statusCode).toBe(404);
		expect((await answerIn(ada, id, 1)).statusCode).toBe(404);
	});

	it('answers 404 for a topic of another course', async () => {
		const { topicIds } = await createCourse(ada, ['Cells']);
		const other = await createCourse(ada, ['Genes']);

		expect((await study(ada, other.courseId, topicIds[0]!)).statusCode).toBe(
			404
		);
	});
});

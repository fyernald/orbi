import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { question, questionReport } from '../../db/schema';
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
	method: 'GET' | 'POST' | 'PATCH',
	url: string,
	payload?: object
) => app.inject({ method, url, headers: { cookie }, payload });

const userIdOf = async (cookie: string) =>
	(await send(cookie, 'GET', '/api/auth/get-session')).json().user.id as string;

// a topic of the user with one question the tutor wrote, already approved
async function createQuestion(cookie: string) {
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
	const [questionId] = await createTutorRepository(db).insertQuestions(
		await userIdOf(cookie),
		topic.id,
		[
			{
				text: 'Which phase lines the chromosomes up?',
				choices: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
				correctChoice: 2,
				explanation: 'They line up in anaphase.',
				aiProvider: 'google',
				aiModel: 'gemini-test',
				chatMessageId: randomUUID(),
			},
		]
	);
	await send(cookie, 'PATCH', `/api/questions/${questionId}`, {
		status: 'approved',
	});
	return {
		questionId: questionId!,
		study: `/api/courses/${course.id}/topics/${topic.id}/study`,
	};
}

const report = (cookie: string, questionId: string, payload: object) =>
	send(cookie, 'POST', `/api/questions/${questionId}/report`, payload);

const reportsOf = (questionId: string) =>
	db
		.select()
		.from(questionReport)
		.where(eq(questionReport.questionId, questionId));

describe('reporting a question', () => {
	it('saves the reason, the comment and the model that made it', async () => {
		const { questionId } = await createQuestion(ada);

		const response = await report(ada, questionId, {
			reason: 'wrong_answer',
			comment: '  Metaphase is the right answer.  ',
		});

		expect(response.statusCode).toBe(201);
		expect(response.json()).toMatchObject({
			id: questionId,
			status: 'rejected',
		});
		expect(await reportsOf(questionId)).toMatchObject([
			{
				userId: await userIdOf(ada),
				reason: 'wrong_answer',
				comment: 'Metaphase is the right answer.',
				aiProvider: 'google',
				aiModel: 'gemini-test',
			},
		]);
	});

	it('takes the question out of study sessions', async () => {
		const { questionId, study } = await createQuestion(ada);

		await report(ada, questionId, { reason: 'unclear' });

		expect((await send(ada, 'GET', study)).json().questions).toEqual([]);
	});

	it('takes a question waiting for review out of the review list', async () => {
		const { questionId } = await createQuestion(ada);
		await send(ada, 'PATCH', `/api/questions/${questionId}`, {
			status: 'pending',
		});

		await report(ada, questionId, { reason: 'not_in_notes' });

		const review = (await send(ada, 'GET', '/api/questions/review')).json();
		expect(
			review.flatMap((group: { questions: { id: string }[] }) =>
				group.questions.map(({ id }) => id)
			)
		).not.toContain(questionId);
	});

	it('saves an empty comment as none', async () => {
		const { questionId } = await createQuestion(ada);

		await report(ada, questionId, { reason: 'unclear', comment: '   ' });

		expect((await reportsOf(questionId))[0]?.comment).toBeNull();
	});

	it('saves no model for a question the student wrote', async () => {
		const { questionId } = await createQuestion(ada);
		await db
			.update(question)
			.set({ source: 'manual', aiProvider: null, aiModel: null })
			.where(eq(question.id, questionId));

		await report(ada, questionId, { reason: 'unclear' });

		expect(await reportsOf(questionId)).toMatchObject([
			{ aiProvider: null, aiModel: null },
		]);
	});

	it.each([
		[{}, 'Pick a reason.'],
		[{ reason: 'boring' }, 'Pick a reason.'],
		[{ reason: 'other' }, 'Say what is wrong with it.'],
		[{ reason: 'other', comment: '  ' }, 'Say what is wrong with it.'],
	])('says what is missing: %o', async (payload, message) => {
		const { questionId } = await createQuestion(ada);

		const response = await report(ada, questionId, payload);

		expect(response.statusCode).toBe(400);
		expect(response.json().error.message).toBe(message);
		expect(await reportsOf(questionId)).toEqual([]);
	});

	it('takes a question once', async () => {
		const { questionId } = await createQuestion(ada);
		await report(ada, questionId, { reason: 'unclear' });

		const response = await report(ada, questionId, { reason: 'wrong_answer' });

		expect(response.statusCode).toBe(409);
		expect(response.json().error.message).toBe(
			'You already reported this question.'
		);
		expect(await reportsOf(questionId)).toHaveLength(1);
	});

	it("cannot report another user's question", async () => {
		const { questionId, study } = await createQuestion(grace);

		const response = await report(ada, questionId, { reason: 'unclear' });

		expect(response.statusCode).toBe(404);
		expect(response.json().error.message).toBe('Question not found.');
		expect((await send(grace, 'GET', study)).json().questions).toHaveLength(1);
	});
});

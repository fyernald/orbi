import { APICallError } from 'ai';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTokenBudget } from '../../ai/budget';
import { createScriptedModels } from '../../ai/testing';
import type { UsageLine } from '../../ai/usage';
import { createMemoryMailer } from '../../mail/testing';
import { createTestApp, signUpTestUser } from '../../testing';

const ai = createScriptedModels();
const usage: UsageLine[] = [];
let app: Awaited<ReturnType<typeof createTestApp>>;
let ada: string;
let grace: string;

beforeAll(async () => {
	app = await createTestApp(createMemoryMailer(), {
		requireEmailVerification: false,
		models: ai.registry,
		logUsage: (line) => usage.push(line),
	});
	ada = await signUpTestUser(app, 'ada@test.dev');
	grace = await signUpTestUser(app, 'grace@test.dev');
});

afterAll(async () => {
	await app.close();
});

beforeEach(() => {
	ai.script();
	usage.length = 0;
});

type TestApp = typeof app;

const send = (
	on: TestApp,
	cookie: string,
	method: 'GET' | 'POST',
	url: string,
	payload?: object
) => on.inject({ method, url, headers: { cookie }, payload });

const NOTE = 'Prophase: chromosomes condense. Anaphase: chromatids separate.';

// a topic with one note and one question; the answer is A (Prophase)
async function createQuestion(
	cookie: string,
	on: TestApp = app,
	choices = ['Prophase', 'Metaphase', 'Anaphase', 'Telophase']
) {
	const course = (
		await send(on, cookie, 'POST', '/api/courses', {
			name: 'Biology 101',
			color: 'teal',
			goal: 'exam_prep',
			topics: ['Mitosis'],
		})
	).json();
	const [topic] = (
		await send(on, cookie, 'GET', `/api/courses/${course.id}/topics`)
	).json();
	const topicUrl = `/api/courses/${course.id}/topics/${topic.id}`;
	await send(on, cookie, 'POST', `${topicUrl}/notes`, {
		title: 'Phases',
		content: NOTE,
	});
	const question = (
		await send(on, cookie, 'POST', `${topicUrl}/questions`, {
			text: 'Which phase comes first?',
			choices,
			correctChoice: 0,
			explanation: 'Mitosis starts with prophase.',
		})
	).json();
	return question.id as string;
}

const explain = (
	cookie: string,
	questionId: string,
	choice: number,
	on: TestApp = app
) =>
	send(on, cookie, 'POST', `/api/questions/${questionId}/explanation`, {
		choice,
	});

// what the model was sent, as one string
const sentToModel = (call = 0) => JSON.stringify(ai.calls[call]?.prompt);

describe('explaining a wrong answer', () => {
	it("explains it from the topic's notes", async () => {
		const questionId = await createQuestion(ada);
		ai.script({ text: '  Prophase comes first, so B is too late.  ' });

		const response = await explain(ada, questionId, 1);

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			questionId,
			choice: 1,
			text: 'Prophase comes first, so B is too late.',
		});
		const sent = sentToModel();
		expect(sent).toContain('Which phase comes first?');
		expect(sent).toContain('The correct answer is A. The student chose B.');
		expect(sent).toContain('Mitosis starts with prophase.');
		expect(sent).toContain('chromosomes condense');
		// a few sentences need no thinking
		expect(ai.thinking).toEqual([false]);
		expect(usage.map(({ action }) => action)).toEqual(['explainAnswer']);
	});

	it('gives back the saved explanation without asking the model again', async () => {
		const questionId = await createQuestion(ada);
		ai.script({ text: 'Prophase comes first.' });
		await explain(ada, questionId, 1);

		ai.script();
		const again = await explain(ada, questionId, 1);

		expect(again.statusCode).toBe(200);
		expect(again.json().text).toBe('Prophase comes first.');
		expect(ai.calls).toHaveLength(0);
	});

	it('explains each wrong choice on its own', async () => {
		const questionId = await createQuestion(ada);
		ai.script({ text: 'B is too late.' }, { text: 'C is far too late.' });

		await explain(ada, questionId, 1);
		const other = await explain(ada, questionId, 2);

		expect(other.json().text).toBe('C is far too late.');
		expect(ai.calls).toHaveLength(2);
	});

	it('refuses the right answer', async () => {
		const questionId = await createQuestion(ada);

		const response = await explain(ada, questionId, 0);

		expect(response.statusCode).toBe(400);
		expect(ai.calls).toHaveLength(0);
	});

	it('refuses a choice the question does not have', async () => {
		const questionId = await createQuestion(ada, app, ['Prophase', 'Anaphase']);

		const response = await explain(ada, questionId, 3);

		expect(response.statusCode).toBe(400);
	});

	it("answers 404 for another user's question", async () => {
		const questionId = await createQuestion(ada);

		const response = await explain(grace, questionId, 1);

		expect(response.statusCode).toBe(404);
		expect(response.json().error.message).toBe('Question not found.');
	});

	it('needs a logged-in user', async () => {
		const questionId = await createQuestion(ada);

		const response = await app.inject({
			method: 'POST',
			url: `/api/questions/${questionId}/explanation`,
			payload: { choice: 1 },
		});

		expect(response.statusCode).toBe(401);
	});
});

describe('when the AI fails', () => {
	it('says so clearly and saves nothing, so Try again asks again', async () => {
		const questionId = await createQuestion(ada);
		ai.script({
			error: new APICallError({
				message: 'overloaded',
				url: 'https://ai.test',
				requestBodyValues: {},
				statusCode: 503,
				isRetryable: false,
			}),
		});

		const failed = await explain(ada, questionId, 1);

		expect(failed.statusCode).toBe(503);
		expect(failed.json().error.message).toBe(
			'The AI service is having problems. Try again in a minute.'
		);

		ai.script({ text: 'Prophase comes first.' });
		const retried = await explain(ada, questionId, 1);
		expect(retried.statusCode).toBe(200);
		expect(retried.json().text).toBe('Prophase comes first.');
	});

	it('does not save an empty answer', async () => {
		const questionId = await createQuestion(ada);
		ai.script({ text: '   ' });

		const response = await explain(ada, questionId, 1);

		expect(response.statusCode).toBe(503);
		expect(response.json().error.message).toBe(
			'Orbi could not explain this one. Try again.'
		);
	});
});

describe('explanations and the daily AI budget', () => {
	const models = createScriptedModels();
	let budgeted: TestApp;
	let cookie: string;

	// one mock model call uses 15 tokens, so the first one uses up a budget of 10
	beforeAll(async () => {
		budgeted = await createTestApp(createMemoryMailer(), {
			requireEmailVerification: false,
			models: models.registry,
			budget: createTokenBudget({ dailyTokens: 10 }),
		});
		cookie = await signUpTestUser(budgeted, 'barbara@test.dev');
	});

	afterAll(async () => {
		await budgeted.close();
	});

	it('asks no model once the budget is used up, but saved ones still come back', async () => {
		const questionId = await createQuestion(cookie, budgeted);
		models.script({ text: 'B is too late.' });
		expect((await explain(cookie, questionId, 1, budgeted)).statusCode).toBe(
			200
		);

		const over = await explain(cookie, questionId, 2, budgeted);
		expect(over.statusCode).toBe(429);

		const saved = await explain(cookie, questionId, 1, budgeted);
		expect(saved.json().text).toBe('B is too late.');
	});
});

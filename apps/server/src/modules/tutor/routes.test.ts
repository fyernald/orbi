import { randomUUID } from 'node:crypto';
import { APICallError } from 'ai';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createScriptedModels } from '../../ai/testing';
import { createMemoryMailer } from '../../mail/testing';
import { createTestApp, signUpTestUser } from '../../testing';
import { createReplyLimiter } from './reply-limiter';

const ai = createScriptedModels();
let app: Awaited<ReturnType<typeof createTestApp>>;
let ada: string;
let grace: string;

beforeAll(async () => {
	app = await createTestApp(createMemoryMailer(), {
		requireEmailVerification: false,
		models: ai.registry,
	});
	ada = await signUpTestUser(app, 'ada@test.dev');
	grace = await signUpTestUser(app, 'grace@test.dev');
});

afterAll(async () => {
	await app.close();
});

beforeEach(() => ai.script());

const send = (
	cookie: string,
	method: 'GET' | 'POST',
	url: string,
	payload?: object
) => app.inject({ method, url, headers: { cookie }, payload });

// a course with one topic, and optionally one note on it
async function createTopic(cookie: string, note?: string) {
	const course = (
		await send(cookie, 'POST', '/api/courses', {
			name: 'Biology 101',
			color: 'teal',
			goal: 'exam_prep',
			topics: ['Mitosis'],
		})
	).json();
	const [topic] = (
		await send(cookie, 'GET', `/api/courses/${course.id}/topics`)
	).json();
	if (note) {
		await send(
			cookie,
			'POST',
			`/api/courses/${course.id}/topics/${topic.id}/notes`,
			{ title: 'Phases', content: note }
		);
	}
	return { courseId: course.id as string, topicId: topic.id as string };
}

type Context = { courseId: string; topicId: string };

const userMessage = (text: string) => ({
	id: randomUUID(),
	role: 'user',
	parts: [{ type: 'text', text }],
});

const ask = (
	cookie: string,
	chatId: string,
	context: Context,
	body: Record<string, unknown>
) =>
	send(cookie, 'POST', `/api/chats/${chatId}/messages`, {
		...context,
		chatTopicId: null,
		modelId: 'gemini-flash',
		action: 'ask',
		trigger: 'submit-message',
		...body,
	});

// the JSON chunks of a Server-Sent Events body
const chunksOf = (body: string) =>
	body
		.split('\n')
		.filter((line) => line.startsWith('data: ') && line !== 'data: [DONE]')
		.map((line) => JSON.parse(line.slice('data: '.length)));

const fiveQuestions = Array.from({ length: 5 }, (_, index) => ({
	text: `Question ${index + 1} about mitosis?`,
	choices: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
	correctChoice: index % 4,
	explanation: 'The notes say so.',
}));

const NOTES = 'Prophase: chromosomes condense.\nAnaphase: chromatids separate.';

describe('tutor chat', () => {
	it('lists the models this server can use', async () => {
		const response = await send(ada, 'GET', '/api/models');

		expect(response.statusCode).toBe(200);
		expect(response.json().defaultModelId).toBe('gemini-flash');
		expect(
			response
				.json()
				.models.every(
					(model: { provider: string }) => model.provider === 'google'
				)
		).toBe(true);
	});

	it('streams a reply from the notes and saves both messages', async () => {
		const context = await createTopic(ada, NOTES);
		const chatId = randomUUID();
		ai.script({ text: 'In anaphase the chromatids separate.' });

		const response = await ask(ada, chatId, context, {
			message: userMessage('What happens in anaphase?\nKeep it short.'),
		});

		expect(response.statusCode).toBe(200);
		expect(response.headers['content-type']).toContain('text/event-stream');
		expect(response.headers['x-accel-buffering']).toBe('no');
		expect(response.headers['cache-control']).toContain('no-transform');
		const text = chunksOf(response.body)
			.filter((chunk) => chunk.type === 'text-delta')
			.map((chunk) => chunk.delta)
			.join('');
		expect(text).toBe('In anaphase the chromatids separate.');

		// the model got the notes
		expect(JSON.stringify(ai.calls[0]!.prompt)).toContain(
			'chromatids separate'
		);

		const thread = (await send(ada, 'GET', `/api/chats/${chatId}`)).json();
		expect(thread.title).toBe('What happens in anaphase?');
		expect(
			thread.messages.map((message: { role: string }) => message.role)
		).toEqual(['user', 'assistant']);
		expect(thread.messages[1].metadata).toMatchObject({
			topicId: context.topicId,
			modelId: 'gemini-flash',
			notesUsed: 1,
		});

		const chats = (
			await send(ada, 'GET', `/api/courses/${context.courseId}/chats`)
		).json();
		expect(chats.map((chat: { id: string }) => chat.id)).toEqual([chatId]);
	});

	it('makes questions with the Questions action and saves them', async () => {
		const context = await createTopic(ada, NOTES);
		const chatId = randomUUID();
		ai.script(
			{ tool: 'createQuestions', input: { questions: fiveQuestions } },
			{ text: 'Here are 5 questions. Try them before you approve them.' }
		);

		const response = await ask(ada, chatId, context, {
			action: 'questions',
			message: userMessage('Make questions from my notes'),
		});

		expect(response.statusCode).toBe(200);
		// the first step must call the tool, the wrap-up must not call it again
		expect(ai.calls[0]!.toolChoice).toEqual({
			type: 'tool',
			toolName: 'createQuestions',
		});
		expect(ai.calls[1]!.toolChoice).toEqual({ type: 'none' });

		const thread = (await send(ada, 'GET', `/api/chats/${chatId}`)).json();
		const toolPart = thread.messages[1].parts.find(
			(part: { type: string }) => part.type === 'tool-createQuestions'
		);
		expect(toolPart.state).toBe('output-available');
		expect(toolPart.output.questionIds).toHaveLength(5);
	});

	it('gives the AI another try when its questions break the rules', async () => {
		const context = await createTopic(ada, NOTES);
		ai.script(
			{
				tool: 'createQuestions',
				input: { questions: fiveQuestions.slice(0, 2) },
			},
			{ tool: 'createQuestions', input: { questions: fiveQuestions } },
			{ text: 'Done.' }
		);

		const response = await ask(ada, randomUUID(), context, {
			action: 'questions',
			message: userMessage('Quiz me'),
		});

		const outputs = chunksOf(response.body).filter(
			(chunk) => chunk.type === 'tool-output-available'
		);
		expect(outputs).toHaveLength(1);
		expect(outputs[0].output.questionIds).toHaveLength(5);
	});

	it('asks for notes before making questions', async () => {
		const context = await createTopic(ada);

		const response = await ask(ada, randomUUID(), context, {
			action: 'questions',
			message: userMessage('Quiz me'),
		});

		expect(response.statusCode).toBe(400);
		expect(response.json().error.message).toBe(
			'Add notes to Mitosis first. Orbi makes questions from your notes.'
		);
		expect(ai.calls).toHaveLength(0);
	});

	it('says when an action is not ready yet', async () => {
		const context = await createTopic(ada, NOTES);

		const response = await ask(ada, randomUUID(), context, {
			action: 'flashcards',
			message: userMessage('Flashcards please'),
		});

		expect(response.statusCode).toBe(400);
		expect(response.json().error.message).toMatch(/coming soon/);
	});

	it('only accepts models from the list', async () => {
		const context = await createTopic(ada, NOTES);

		const response = await ask(ada, randomUUID(), context, {
			modelId: 'claude-opus',
			message: userMessage('Hi'),
		});

		expect(response.statusCode).toBe(400);
		expect(response.json().error.message).toBe('Choose a model from the list.');
	});

	it('pauses on a clarifying question and goes on with the answer', async () => {
		const context = await createTopic(ada, NOTES);
		const chatId = randomUUID();
		ai.script({
			tool: 'askStudent',
			input: {
				question: 'Mitosis only, or meiosis too?',
				options: ['Only mitosis', 'Both'],
			},
		});
		await ask(ada, chatId, context, {
			message: userMessage('Make me something to practise'),
		});

		const paused = (await send(ada, 'GET', `/api/chats/${chatId}`)).json();
		const reply = paused.messages[1];
		const question = reply.parts.find(
			(part: { type: string }) => part.type === 'tool-askStudent'
		);
		expect(question.state).toBe('input-available');

		ai.script({ text: 'Great, mitosis it is.' });
		const answered = {
			id: reply.id,
			role: 'assistant',
			parts: reply.parts.map((part: { type: string }) =>
				part === question
					? {
							...question,
							state: 'output-available',
							output: { answer: 'Only mitosis', skipped: false },
						}
					: part
			),
		};
		const response = await ask(ada, chatId, context, { message: answered });

		expect(response.statusCode).toBe(200);
		const after = (await send(ada, 'GET', `/api/chats/${chatId}`)).json();
		expect(after.messages).toHaveLength(2);
		expect(JSON.stringify(after.messages[1].parts)).toContain(
			'Great, mitosis it is.'
		);
	});

	it('counts an unanswered question as skipped when the student writes again', async () => {
		const context = await createTopic(ada, NOTES);
		const chatId = randomUUID();
		ai.script({
			tool: 'askStudent',
			input: { question: 'Which phase?', options: ['Prophase', 'Anaphase'] },
		});
		await ask(ada, chatId, context, {
			message: userMessage('Explain a phase'),
		});

		ai.script({ text: 'Let me explain anaphase.' });
		const response = await ask(ada, chatId, context, {
			message: userMessage('Never mind, explain anaphase'),
		});

		expect(response.statusCode).toBe(200);
		const thread = (await send(ada, 'GET', `/api/chats/${chatId}`)).json();
		const question = thread.messages[1].parts.find(
			(part: { type: string }) => part.type === 'tool-askStudent'
		);
		expect(question.output).toEqual({ answer: '', skipped: true });
		expect(thread.messages).toHaveLength(4);
	});

	it('tries the last reply again and replaces it', async () => {
		const context = await createTopic(ada, NOTES);
		const chatId = randomUUID();
		ai.script({ text: 'First try.' });
		await ask(ada, chatId, context, {
			message: userMessage('Explain prophase'),
		});

		ai.script({ text: 'Second try.' });
		const response = await ask(ada, chatId, context, {
			trigger: 'regenerate-message',
		});

		expect(response.statusCode).toBe(200);
		const thread = (await send(ada, 'GET', `/api/chats/${chatId}`)).json();
		expect(thread.messages).toHaveLength(2);
		expect(JSON.stringify(thread.messages[1].parts)).toContain('Second try.');
	});

	it('tries again when the last message is sent again', async () => {
		const context = await createTopic(ada, NOTES);
		const chatId = randomUUID();
		const message = userMessage('Explain metaphase');
		ai.script({ text: 'Half an answ' });
		await ask(ada, chatId, context, { message });

		ai.script({ text: 'A full answer.' });
		const again = await ask(ada, chatId, context, { message });

		expect(again.statusCode).toBe(200);
		const thread = (await send(ada, 'GET', `/api/chats/${chatId}`)).json();
		expect(thread.messages).toHaveLength(2);
		expect(JSON.stringify(thread.messages[1].parts)).toContain(
			'A full answer.'
		);
	});

	it('refuses to send an older message again', async () => {
		const context = await createTopic(ada, NOTES);
		const chatId = randomUUID();
		const first = userMessage('First question');
		ai.script({ text: 'One.' });
		await ask(ada, chatId, context, { message: first });
		ai.script({ text: 'Two.' });
		await ask(ada, chatId, context, {
			message: userMessage('Second question'),
		});

		const response = await ask(ada, chatId, context, { message: first });

		expect(response.statusCode).toBe(409);
	});

	it('shows a clear error when the AI service fails, and keeps the question', async () => {
		const context = await createTopic(ada, NOTES);
		const chatId = randomUUID();
		ai.script({
			error: new APICallError({
				message: 'Resource exhausted',
				url: 'https://ai.test',
				requestBodyValues: {},
				statusCode: 429,
				isRetryable: false,
			}),
		});

		const response = await ask(ada, chatId, context, {
			message: userMessage('Explain telophase'),
		});

		const error = chunksOf(response.body).find(
			(chunk) => chunk.type === 'error'
		);
		expect(error.errorText).toBe(
			'This model has reached its limit for now. Try again later, or pick another model.'
		);
		const thread = (await send(ada, 'GET', `/api/chats/${chatId}`)).json();
		expect(
			thread.messages.map((message: { role: string }) => message.role)
		).toEqual(['user']);
	});

	it('refuses an empty message', async () => {
		const context = await createTopic(ada, NOTES);

		const response = await ask(ada, randomUUID(), context, {
			message: userMessage('   '),
		});

		expect(response.statusCode).toBe(400);
		expect(response.json().error.message).toBe('Write a message first.');
	});

	it('needs a logged-in user', async () => {
		const response = await app.inject({ method: 'GET', url: '/api/models' });

		expect(response.statusCode).toBe(401);
	});
});

describe('long chats', () => {
	it('opens on the newest messages and loads earlier ones on request', async () => {
		const context = await createTopic(ada, NOTES);
		const chatId = randomUUID();
		// 16 questions and replies: 32 messages, more than one page of 30
		for (let turn = 1; turn <= 16; turn += 1) {
			ai.script({ text: `Answer ${turn}` });
			await ask(ada, chatId, context, {
				message: userMessage(`Question ${turn}`),
			});
		}

		const thread = (await send(ada, 'GET', `/api/chats/${chatId}`)).json();
		const earlier = (
			await send(
				ada,
				'GET',
				`/api/chats/${chatId}/messages?before=${thread.messages[0].id}`
			)
		).json();

		const text = (message: { parts: { text?: string }[] }) =>
			message.parts.map((part) => part.text ?? '').join('');
		expect(thread.messages).toHaveLength(30);
		expect(thread.hasEarlier).toBe(true);
		expect(text(thread.messages[0])).toBe('Question 2');
		expect(text(thread.messages.at(-1))).toBe('Answer 16');
		expect(earlier.messages.map(text)).toEqual(['Question 1', 'Answer 1']);
		expect(earlier.hasEarlier).toBe(false);
	});

	it("does not show another user's messages", async () => {
		const context = await createTopic(ada, NOTES);
		const chatId = randomUUID();
		ai.script({ text: 'Private.' });
		await ask(ada, chatId, context, { message: userMessage('Hi') });
		const thread = (await send(ada, 'GET', `/api/chats/${chatId}`)).json();

		const response = await send(
			grace,
			'GET',
			`/api/chats/${chatId}/messages?before=${thread.messages[1].id}`
		);

		expect(response.statusCode).toBe(404);
	});
});

describe('the whole-course chat', () => {
	it('answers from the notes of every topic', async () => {
		const context = await createTopic(ada, NOTES);
		ai.script({ text: 'About the whole course.' });

		const response = await ask(ada, randomUUID(), context, {
			topicId: null,
			message: userMessage('What did I study?'),
		});

		expect(response.statusCode).toBe(200);
		const prompt = JSON.stringify(ai.calls[0]!.prompt);
		expect(prompt).toContain('as a whole');
		expect(prompt).toContain('topic=\\"Mitosis\\"');
		// practice questions need a topic, so the model is not offered the tool
		expect(ai.calls[0]!.tools?.map((tool) => tool.name)).toEqual([
			'askStudent',
		]);
	});

	it('asks for a topic before making questions', async () => {
		const context = await createTopic(ada, NOTES);

		const response = await ask(ada, randomUUID(), context, {
			topicId: null,
			action: 'questions',
			message: userMessage('Quiz me'),
		});

		expect(response.statusCode).toBe(400);
		expect(response.json().error.message).toBe(
			'Pick a topic first. Practice questions belong to one topic.'
		);
	});
});

describe('chats per topic', () => {
	it('keeps a chat for each topic and one for the whole course', async () => {
		const context = await createTopic(ada, NOTES);
		const topicChat = randomUUID();
		const courseChat = randomUUID();
		ai.script({ text: 'About mitosis.' });
		await ask(ada, topicChat, context, {
			chatTopicId: context.topicId,
			message: userMessage('Mitosis question'),
		});
		ai.script({ text: 'About the course.' });
		await ask(ada, courseChat, context, {
			message: userMessage('Course question'),
		});

		const chats = (
			await send(ada, 'GET', `/api/courses/${context.courseId}/chats`)
		).json();

		expect(
			Object.fromEntries(
				chats.map((chat: { id: string; topicId: string | null }) => [
					chat.id,
					chat.topicId,
				])
			)
		).toEqual({ [topicChat]: context.topicId, [courseChat]: null });
	});

	it("keeps a topic's chat on that topic", async () => {
		const context = await createTopic(ada, NOTES);
		const chatId = randomUUID();
		ai.script({ text: 'About mitosis.' });
		await ask(ada, chatId, context, {
			chatTopicId: context.topicId,
			message: userMessage('Mitosis question'),
		});

		const asCourseChat = await ask(ada, chatId, context, {
			message: userMessage('Now as the course chat'),
		});
		const otherTopic = await ask(ada, chatId, context, {
			chatTopicId: context.topicId,
			topicId: randomUUID(),
			message: userMessage('Another topic'),
		});

		expect(asCourseChat.statusCode).toBe(404);
		expect(otherTopic.statusCode).toBe(400);
		expect(otherTopic.json().error.message).toBe(
			"A topic's chat can only be about that topic."
		);
	});

	it("deletes a topic's chats with the topic", async () => {
		const context = await createTopic(ada, NOTES);
		const chatId = randomUUID();
		ai.script({ text: 'About mitosis.' });
		await ask(ada, chatId, context, {
			chatTopicId: context.topicId,
			message: userMessage('Mitosis question'),
		});

		await app.inject({
			method: 'DELETE',
			url: `/api/courses/${context.courseId}/topics/${context.topicId}`,
			headers: { cookie: ada },
		});

		expect((await send(ada, 'GET', `/api/chats/${chatId}`)).statusCode).toBe(
			404
		);
	});
});

describe('replies at the same time', () => {
	it('refuses a reply over the limit and frees the place when one ends', async () => {
		const models = createScriptedModels();
		const limited = await createTestApp(createMemoryMailer(), {
			requireEmailVerification: false,
			models: models.registry,
			limiter: createReplyLimiter(1),
		});
		const cookie = await signUpTestUser(limited, 'mae@test.dev');
		const post = (url: string, payload: object) =>
			limited.inject({ method: 'POST', url, headers: { cookie }, payload });
		const course = (
			await post('/api/courses', {
				name: 'Biology',
				color: 'teal',
				goal: 'keep_up',
				topics: ['Mitosis'],
			})
		).json();
		const [topic] = (
			await limited.inject({
				method: 'GET',
				url: `/api/courses/${course.id}/topics`,
				headers: { cookie },
			})
		).json();
		const body = (text: string) => ({
			courseId: course.id,
			chatTopicId: null,
			topicId: topic.id,
			modelId: 'gemini-flash',
			action: 'ask',
			trigger: 'submit-message',
			message: userMessage(text),
		});
		models.script({ text: 'Slow answer.', delayMs: 300 }, { text: 'Next.' });

		const [slow, refused] = await Promise.all([
			post(`/api/chats/${randomUUID()}/messages`, body('First')),
			new Promise((resolve) => setTimeout(resolve, 50)).then(() =>
				post(`/api/chats/${randomUUID()}/messages`, body('Second'))
			),
		]);
		const after = await post(
			`/api/chats/${randomUUID()}/messages`,
			body('Third')
		);
		await limited.close();

		expect(slow.statusCode).toBe(200);
		expect(refused.statusCode).toBe(429);
		expect(refused.json().error.message).toBe(
			'You can have 3 replies running at once. Wait for one to finish.'
		);
		expect(after.statusCode).toBe(200);
	});
});

describe("another user's chat", () => {
	it('answers like a chat that does not exist', async () => {
		const context = await createTopic(ada, NOTES);
		const chatId = randomUUID();
		ai.script({ text: 'Hello Ada.' });
		await ask(ada, chatId, context, { message: userMessage('Hi') });

		const graceContext = await createTopic(grace, NOTES);
		const read = await send(grace, 'GET', `/api/chats/${chatId}`);
		const write = await ask(grace, chatId, graceContext, {
			message: userMessage('Sneaky'),
		});
		const topic = await ask(grace, randomUUID(), context, {
			message: userMessage('Sneaky'),
		});
		const list = await send(
			grace,
			'GET',
			`/api/courses/${context.courseId}/chats`
		);

		expect(read.statusCode).toBe(404);
		expect(write.statusCode).toBe(404);
		expect(topic.statusCode).toBe(404);
		expect(list.statusCode).toBe(404);
	});
});

describe('without an AI key', () => {
	it('says the tutor is not set up', async () => {
		const bare = await createTestApp(createMemoryMailer(), {
			requireEmailVerification: false,
		});
		const cookie = await signUpTestUser(bare, 'nali@test.dev');
		const course = (
			await bare.inject({
				method: 'POST',
				url: '/api/courses',
				headers: { cookie },
				payload: {
					name: 'Physics',
					color: 'blue',
					goal: 'keep_up',
					topics: ['Waves'],
				},
			})
		).json();
		const [topic] = (
			await bare.inject({
				method: 'GET',
				url: `/api/courses/${course.id}/topics`,
				headers: { cookie },
			})
		).json();

		const models = await bare.inject({
			method: 'GET',
			url: '/api/models',
			headers: { cookie },
		});
		const response = await bare.inject({
			method: 'POST',
			url: `/api/chats/${randomUUID()}/messages`,
			headers: { cookie },
			payload: {
				courseId: course.id,
				chatTopicId: null,
				topicId: topic.id,
				modelId: 'gemini-flash',
				action: 'ask',
				trigger: 'submit-message',
				message: userMessage('Hi'),
			},
		});
		await bare.close();

		expect(models.json()).toEqual({ models: [], defaultModelId: null });
		expect(response.statusCode).toBe(503);
		expect(response.json().error.message).toBe(
			'The AI tutor is not set up on this server yet.'
		);
	});
});

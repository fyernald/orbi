import { VOICE_NOTE_MAX_SIZE } from '@orbi/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createScriptedModels } from '../../../ai/testing';
import { createMemoryMailer } from '../../../mail/testing';
import { createTestApp, signUpTestUser } from '../../../testing';

const ai = createScriptedModels();
let app: Awaited<ReturnType<typeof createTestApp>>;
let ada: string;
let notesUrl: string;

beforeAll(async () => {
	app = await createTestApp(createMemoryMailer(), {
		requireEmailVerification: false,
		models: ai.registry,
	});
	ada = await signUpTestUser(app, 'ada@test.dev');
	const course = (
		await app.inject({
			method: 'POST',
			url: '/api/courses',
			headers: { cookie: ada },
			payload: {
				name: 'Biology 101',
				color: 'teal',
				goal: 'exam_prep',
				topics: ['Cells'],
			},
		})
	).json();
	const [topic] = (
		await app.inject({
			method: 'GET',
			url: `/api/courses/${course.id}/topics`,
			headers: { cookie: ada },
		})
	).json();
	notesUrl = `/api/courses/${course.id}/topics/${topic.id}/notes`;
});

afterAll(async () => {
	await app.close();
});

const record = ({
	query = 'modelId=gemini-flash&tidy=0&seconds=12',
	type = 'audio/webm',
	body = Buffer.from([1, 2, 3, 4]),
	cookie = ada,
}: {
	query?: string;
	type?: string;
	body?: Buffer;
	cookie?: string;
} = {}) =>
	app.inject({
		method: 'POST',
		url: `${notesUrl}/voice?${query}`,
		headers: { cookie, 'content-type': type },
		payload: body,
	});

describe('voice notes', () => {
	it('turns a recording into a note on the topic', async () => {
		ai.script({ text: 'Mitosis has four phases.' });

		const response = await record();

		expect(response.statusCode).toBe(201);
		expect(response.json()).toMatchObject({
			title: 'Mitosis has four phases.',
			content: 'Mitosis has four phases.',
			sourceName: null,
		});
		const notes = (
			await app.inject({
				method: 'GET',
				url: notesUrl,
				headers: { cookie: ada },
			})
		).json();
		expect(notes[0].id).toBe(response.json().id);
	});

	it("takes Safari's recordings, with their codec in the type", async () => {
		ai.script({ text: 'Meiosis makes four cells.' });

		const response = await record({ type: 'audio/mp4;codecs=mp4a.40.2' });

		expect(response.statusCode).toBe(201);
		expect(JSON.stringify(ai.calls[0]!.prompt)).toContain(
			'"mediaType":"audio/m4a"'
		);
	});

	it('refuses a recording longer than five minutes', async () => {
		const response = await record({
			query: 'modelId=gemini-flash&tidy=0&seconds=301',
		});

		expect(response.statusCode).toBe(400);
		expect(response.json().error.message).toBe(
			'Recordings can be at most 5 minutes.'
		);
	});

	it('refuses a recording larger than five minutes can be', async () => {
		const response = await record({
			body: Buffer.alloc(VOICE_NOTE_MAX_SIZE + 1),
		});

		expect(response.statusCode).toBe(413);
	});

	it('refuses a file that is not audio', async () => {
		const response = await record({ type: 'video/mp4' });

		expect(response.statusCode).toBe(415);
	});

	it('refuses a model the server cannot call', async () => {
		const response = await record({ query: 'modelId=nope&tidy=1&seconds=5' });

		expect(response.statusCode).toBe(400);
		expect(response.json().error.message).toBe('Choose a model from the list.');
	});

	it('needs a login', async () => {
		const response = await record({ cookie: '' });

		expect(response.statusCode).toBe(401);
	});
});

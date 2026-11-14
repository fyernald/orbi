import type { KeyPointsEvent } from '@orbi/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createScriptedModels } from '../../../ai/testing';
import { createMemoryMailer } from '../../../mail/testing';
import { createTestPdf } from '../../../pdf/testing';
import { createTestApp, signUpTestUser } from '../../../testing';

const ai = createScriptedModels();
let app: Awaited<ReturnType<typeof createTestApp>>;
let ada: string;

beforeAll(async () => {
	app = await createTestApp(createMemoryMailer(), {
		requireEmailVerification: false,
		models: ai.registry,
	});
	ada = await signUpTestUser(app, 'ada@test.dev');
});

afterAll(async () => {
	await app.close();
});

const send = (
	method: 'GET' | 'POST' | 'DELETE',
	url: string,
	payload?: object
) => app.inject({ method, url, headers: { cookie: ada }, payload });

// a topic with a PDF uploaded to it, and the urls to use
async function topicWithPdf(pages = ['Mitosis has four phases.']) {
	const course = (
		await send('POST', '/api/courses', {
			name: 'Biology 101',
			color: 'teal',
			goal: 'exam_prep',
			topics: ['Cells'],
		})
	).json();
	const [topic] = (
		await send('GET', `/api/courses/${course.id}/topics`)
	).json();
	const notesUrl = `/api/courses/${course.id}/topics/${topic.id}/notes`;
	const upload = await app.inject({
		method: 'POST',
		url: `${notesUrl}/pdf?fileName=cells.pdf`,
		headers: { cookie: ada, 'content-type': 'application/pdf' },
		payload: Buffer.from(createTestPdf(pages)),
	});
	return { notesUrl, fileHash: upload.json().fileHash as string };
}

const events = (body: string): KeyPointsEvent[] =>
	body
		.split('\n')
		.filter((line) => line.trim())
		.map((line) => JSON.parse(line));

describe('writing the key points of an uploaded PDF', () => {
	it('streams the progress and saves the notes with the PDF name', async () => {
		const { notesUrl, fileHash } = await topicWithPdf();
		ai.script({ text: '## Mitosis\n- Four phases' });

		const response = await send('POST', `${notesUrl}/key-points`, {
			fileHash,
			modelId: 'gemini-flash',
		});

		expect(response.statusCode).toBe(200);
		expect(response.headers['content-type']).toContain('application/x-ndjson');
		const streamed = events(response.body);
		expect(streamed.slice(0, 2)).toEqual([
			{ type: 'progress', done: 0, total: 1 },
			{ type: 'progress', done: 1, total: 1 },
		]);
		const notes = (await send('GET', notesUrl)).json();
		expect(streamed.at(-1)).toEqual({ type: 'done', notes });
		expect(notes).toEqual([
			expect.objectContaining({
				title: 'cells · key points',
				content: '## Mitosis\n- Four phases',
				sourceName: 'cells.pdf',
			}),
		]);
		expect((await send('GET', `${notesUrl}/pdfs`)).json()).toEqual([]);
	});

	it('refuses a model the server cannot call before it starts', async () => {
		const { notesUrl, fileHash } = await topicWithPdf();

		const response = await send('POST', `${notesUrl}/key-points`, {
			fileHash,
			modelId: 'nope',
		});

		expect(response.statusCode).toBe(400);
		expect(response.json().error.message).toBe('Choose a model from the list.');
	});

	it('sends an error and saves nothing when the AI fails', async () => {
		const { notesUrl, fileHash } = await topicWithPdf();
		ai.script({ error: new Error('provider exploded') });

		const response = await send('POST', `${notesUrl}/key-points`, {
			fileHash,
			modelId: 'gemini-flash',
		});

		expect(events(response.body).at(-1)).toEqual({
			type: 'error',
			message: 'Orbi could not write notes from this PDF. Try again.',
		});
		expect((await send('GET', notesUrl)).json()).toEqual([]);
		// still there, so the student can try again without uploading
		expect((await send('GET', `${notesUrl}/pdfs`)).json()).toHaveLength(1);
	});

	it('answers a PDF that is not on the topic', async () => {
		const { notesUrl } = await topicWithPdf();

		const response = await send('POST', `${notesUrl}/key-points`, {
			fileHash: 'b'.repeat(64),
			modelId: 'gemini-flash',
		});

		expect(response.statusCode).toBe(404);
	});

	it('removes the hidden text with the last note of its PDF', async () => {
		const { notesUrl, fileHash } = await topicWithPdf();
		ai.script({ text: '## Mitosis' });
		await send('POST', `${notesUrl}/key-points`, {
			fileHash,
			modelId: 'gemini-flash',
		});
		const [note] = (await send('GET', notesUrl)).json();

		await send('DELETE', `${notesUrl}/${note.id}`);

		expect((await send('GET', `${notesUrl}/pdfs`)).json()).toEqual([]);
		const again = await send('POST', `${notesUrl}/key-points`, {
			fileHash,
			modelId: 'gemini-flash',
		});
		expect(again.statusCode).toBe(404);
	});
});

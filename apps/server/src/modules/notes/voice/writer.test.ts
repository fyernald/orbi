import type { Note } from '@orbi/shared';
import { describe, expect, it, vi } from 'vitest';
import { createModelResolver } from '../../../ai/model-resolver';
import { createScriptedModels } from '../../../ai/testing';
import { UsageLimitError } from '../../../errors';
import type { NoteRepository } from '../repository';
import { createVoiceNoteWriter, type VoiceNoteInput } from './writer';

const ai = createScriptedModels();
const audio = new Uint8Array([1, 2, 3]);
const input: VoiceNoteInput = {
	modelId: 'gemini-flash',
	tidy: false,
	mediaType: 'audio/webm',
	audio,
};
const saved: Note = {
	id: '00000000-0000-4000-8000-000000000001',
	topicId: '00000000-0000-4000-8000-000000000002',
	title: 'Mitosis has four phases.',
	content: 'Mitosis has four phases.',
	sourceName: null,
	createdAt: '2026-11-14T10:00:00.000Z',
	updatedAt: '2026-11-14T10:00:00.000Z',
};

function setup({
	requireRoom = async () => {},
	resolveModel = createModelResolver(ai.registry),
} = {}) {
	const repo = {
		topicExists: vi.fn(async () => true),
		insertNote: vi.fn(async () => saved),
	} satisfies Partial<NoteRepository>;
	const release = vi.fn();
	const logError = vi.fn();
	const write = createVoiceNoteWriter({
		repo,
		resolveModel,
		usage: { requireRoom: vi.fn(requireRoom) },
		takePlace: () => release,
		trackStep: () => async () => {},
		logError,
	});
	return { repo, release, logError, write };
}

const signal = () => new AbortController().signal;

describe('writing a voice note', () => {
	it('sends the recording to the picked model and saves what it wrote', async () => {
		ai.script({ text: 'Mitosis has four phases.' });
		const { repo, release, write } = setup();

		const note = await write('ada', 'course', 'topic', input, signal());

		expect(note).toEqual(saved);
		const [message] = ai.calls[0]!.prompt.filter(({ role }) => role === 'user');
		expect(message!.content).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: 'file',
					mediaType: 'audio/webm',
				}),
			])
		);
		expect(JSON.stringify(ai.calls[0]!.prompt)).toContain('word for word');
		expect(repo.insertNote).toHaveBeenCalledWith('ada', 'topic', {
			title: 'Mitosis has four phases.',
			content: 'Mitosis has four phases.',
		});
		expect(release).toHaveBeenCalledOnce();
	});

	it('asks for a tidy note when the student wants one', async () => {
		ai.script({ text: 'Mitosis\n\n- Four phases' });
		const { repo, write } = setup();

		await write('ada', 'course', 'topic', { ...input, tidy: true }, signal());

		expect(JSON.stringify(ai.calls[0]!.prompt)).toContain(
			'Add nothing they did not say'
		);
		expect(repo.insertNote).toHaveBeenCalledWith('ada', 'topic', {
			title: 'Mitosis',
			content: 'Mitosis\n\n- Four phases',
		});
	});

	it('refuses a model that cannot listen, before anything is sent', async () => {
		ai.script();
		const resolveModel = createModelResolver(ai.registry);
		const { write } = setup({
			resolveModel: (modelId, options) => {
				const resolved = resolveModel(modelId, options);
				return {
					...resolved,
					entry: { ...resolved.entry, label: 'Claude Haiku', audio: false },
				};
			},
		});

		await expect(
			write('ada', 'course', 'topic', input, signal())
		).rejects.toThrow('Claude Haiku cannot listen to recordings.');
		expect(ai.calls).toHaveLength(0);
	});

	it('stops at the usage limit before the model is called', async () => {
		ai.script();
		const { write } = setup({
			requireRoom: async () => {
				throw new UsageLimitError('Hour limit used.');
			},
		});

		await expect(
			write('ada', 'course', 'topic', input, signal())
		).rejects.toBeInstanceOf(UsageLimitError);
		expect(ai.calls).toHaveLength(0);
	});

	it('saves nothing when there was no speech', async () => {
		ai.script({ text: '[no speech]' });
		const { repo, write } = setup();

		await expect(
			write('ada', 'course', 'topic', input, signal())
		).rejects.toThrow('Orbi could not hear any speech in this recording.');
		expect(repo.insertNote).not.toHaveBeenCalled();
	});

	it('gives a clear message, logs the cause and frees the place when the AI fails', async () => {
		ai.script({ error: new Error('provider exploded') });
		const { repo, release, logError, write } = setup();

		await expect(
			write('ada', 'course', 'topic', input, signal())
		).rejects.toThrow('Orbi could not turn this recording into a note.');
		expect(logError).toHaveBeenCalledOnce();
		expect(release).toHaveBeenCalledOnce();
		expect(repo.insertNote).not.toHaveBeenCalled();
	});

	it('saves nothing after a cancel', async () => {
		ai.script({ text: 'Mitosis has four phases.' });
		const { repo, logError, write } = setup();
		const controller = new AbortController();
		controller.abort();

		await expect(
			write('ada', 'course', 'topic', input, controller.signal)
		).rejects.toThrow();
		expect(repo.insertNote).not.toHaveBeenCalled();
		expect(logError).not.toHaveBeenCalled();
	});

	it('answers a topic that is not there', async () => {
		const { repo, write } = setup();
		repo.topicExists.mockResolvedValue(false);

		await expect(
			write('ada', 'course', 'topic', input, signal())
		).rejects.toThrow('Topic not found.');
	});
});

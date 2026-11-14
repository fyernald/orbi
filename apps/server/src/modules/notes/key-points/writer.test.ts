import type { Note } from '@orbi/shared';
import { describe, expect, it, vi } from 'vitest';
import { createModelResolver } from '../../../ai/model-resolver';
import { createScriptedModels } from '../../../ai/testing';
import { UsageLimitError } from '../../../errors';
import type { NoteRepository } from '../repository';
import { createKeyPointWriter } from './writer';

const ai = createScriptedModels();
const fileHash = 'a'.repeat(64);
const input = { fileHash, modelId: 'gemini-flash' };
const saved: Note = {
	id: '00000000-0000-4000-8000-000000000001',
	topicId: '00000000-0000-4000-8000-000000000002',
	title: 'cells · key points',
	content: '## One',
	sourceName: 'cells.pdf',
	createdAt: '2026-11-14T10:00:00.000Z',
	updatedAt: '2026-11-14T10:00:00.000Z',
};

// two pages that are two model calls
const pdfText = {
	name: 'cells.pdf',
	ids: ['t1', 't2'],
	parts: ['a'.repeat(30_000), 'b'.repeat(30_000)],
};

function setup({ written = [] as Note[], requireRoom = async () => {} } = {}) {
	const repo = {
		topicExists: vi.fn(async () => true),
		listPdfNotes: vi.fn(async () => written),
		findPdfText: vi.fn(async () => pdfText),
		insertPdfNotes: vi.fn(async () => [saved]),
	} satisfies Partial<NoteRepository>;
	const prepare = createKeyPointWriter({
		repo,
		resolveModel: createModelResolver(ai.registry),
		usage: { requireRoom: vi.fn(requireRoom) },
		takePlace: () => () => {},
		trackStep: () => async () => {},
		logError: () => {},
		partsAtOnce: 1,
	});
	return { repo, prepare };
}

const run = (signal = new AbortController().signal) => {
	const progress: string[] = [];
	return {
		signal,
		progress,
		onProgress: (done: number, total: number) =>
			progress.push(`${done}/${total}`),
	};
};

describe('writing the key points of a PDF', () => {
	it('reads every part in order with the picked model, then saves one note', async () => {
		ai.script({ text: '## One' }, { text: '## Two' });
		const { repo, prepare } = setup();

		const job = await prepare('ada', 'course', 'topic', input);
		const events = run();
		const notes = await job.run(events);

		expect(job.total).toBe(2);
		expect(events.progress).toEqual(['1/2', '2/2']);
		expect(ai.calls).toHaveLength(2);
		expect(JSON.stringify(ai.calls[0]!.prompt)).toContain('part 1 of 2');
		expect(JSON.stringify(ai.calls[1]!.prompt)).toContain('part 2 of 2');
		expect(repo.insertPdfNotes).toHaveBeenCalledWith(
			'ada',
			'topic',
			[{ title: 'cells · key points', content: '## One\n\n## Two' }],
			{ name: 'cells.pdf', hash: fileHash }
		);
		expect(notes).toEqual([saved]);
	});

	it('gives back notes already written without a model call', async () => {
		ai.script();
		const { prepare } = setup({ written: [saved] });

		const job = await prepare('ada', 'course', 'topic', input);

		expect(job.total).toBe(0);
		await expect(job.run(run())).resolves.toEqual([saved]);
		expect(ai.calls).toHaveLength(0);
	});

	it('refuses a model the server cannot call, never picking another', async () => {
		const { prepare } = setup();

		await expect(
			prepare('ada', 'course', 'topic', { fileHash, modelId: 'nope' })
		).rejects.toMatchObject({
			status: 400,
			message: 'Choose a model from the list.',
		});
	});

	it('stops at a limit reached partway and saves nothing', async () => {
		ai.script({ text: '## One' }, { text: '## Two' });
		let checks = 0;
		const { repo, prepare } = setup({
			requireRoom: async () => {
				checks += 1;
				// the job's check, then the first part's; the second part is over the limit
				if (checks > 2) throw new UsageLimitError('Hour limit used.');
			},
		});

		const job = await prepare('ada', 'course', 'topic', input);

		await expect(job.run(run())).rejects.toThrow('Hour limit used.');
		expect(repo.insertPdfNotes).not.toHaveBeenCalled();
	});

	it('answers a failed model call with a clear message and saves nothing', async () => {
		ai.script({ error: new Error('provider exploded') });
		const { repo, prepare } = setup();

		const job = await prepare('ada', 'course', 'topic', input);

		await expect(job.run(run())).rejects.toMatchObject({
			status: 503,
			message: 'Orbi could not write notes from this PDF. Try again.',
		});
		expect(repo.insertPdfNotes).not.toHaveBeenCalled();
	});

	it('saves nothing when the student cancels', async () => {
		ai.script({ text: '## One' }, { text: '## Two' });
		const { repo, prepare } = setup();
		const job = await prepare('ada', 'course', 'topic', input);
		const controller = new AbortController();
		controller.abort();

		await expect(job.run(run(controller.signal))).rejects.toThrow();
		expect(ai.calls).toHaveLength(0);
		expect(repo.insertPdfNotes).not.toHaveBeenCalled();
	});
});

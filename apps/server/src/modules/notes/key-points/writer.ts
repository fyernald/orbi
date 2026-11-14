import type { KeyPointsInput, Note } from '@orbi/shared';
import { generateText } from 'ai';
import type { ResolveModel } from '../../../ai/model-resolver';
import type { ResolvedModel } from '../../../ai/models';
import {
	AppError,
	NotFoundError,
	ServiceUnavailableError,
} from '../../../errors';
import { mapLimit } from '../../../map-limit';
import { replyErrorMessage } from '../../tutor/reply-errors';
import type { TakePlace } from '../../tutor/reply-limiter';
import type { TrackStep } from '../../tutor/step-tracker';
import type { UsageService } from '../../usage/service';
import type { NoteRepository, PdfText } from '../repository';
import { keyPointNotes, modelParts } from './parts';
import {
	cleanKeyPoints,
	KEY_POINTS_MAX_OUTPUT_TOKENS,
	KEY_POINTS_PART_TIMEOUT_MS,
	keyPointsInstructions,
	keyPointsPrompt,
} from './prompt';

// a few parts of a long PDF at once, so it does not take minutes, without
// sending the AI service a burst it would refuse
const PARTS_AT_ONCE = 3;

const PDF_GONE = 'This PDF was not found. Upload it again.';
const NOTHING_WRITTEN = 'Orbi could not write notes from this PDF. Try again.';
const topicGone = () => new NotFoundError('Topic not found.');

export type KeyPointsRun = {
	// Cancel in the browser, or a closed tab: the model stops and nothing is saved
	signal: AbortSignal;
	onProgress: (done: number, total: number) => void;
};

// The checks run first, so a missing file, a model the server cannot call or a
// used-up limit is a normal error answer; run then writes the notes. A PDF with
// notes already gives them back without a model call (total 0).
export type KeyPointsJob = {
	total: number;
	run(run: KeyPointsRun): Promise<Note[]>;
};

export type PrepareKeyPoints = (
	userId: string,
	courseId: string,
	topicId: string,
	input: KeyPointsInput
) => Promise<KeyPointsJob>;

type Deps = {
	repo: Pick<
		NoteRepository,
		'topicExists' | 'listPdfNotes' | 'findPdfText' | 'insertPdfNotes'
	>;
	resolveModel: ResolveModel;
	// throws when the student is over an AI usage limit
	usage: Pick<UsageService, 'requireRoom'>;
	takePlace: TakePlace;
	trackStep: TrackStep;
	logError: (error: unknown) => void;
	partsAtOnce?: number;
};

// what one job needs to know about the student, the file and the model
type Job = {
	userId: string;
	topicId: string;
	fileHash: string;
	text: PdfText;
	parts: string[];
	resolved: ResolvedModel;
};

// Writes the key points of a PDF the student uploaded (US-44), from the text
// saved with it, with the model the student picked. Every part of the file is
// read, in order, and the notes are saved only when all parts are done.
export function createKeyPointWriter({
	repo,
	resolveModel,
	usage,
	takePlace,
	trackStep,
	logError,
	partsAtOnce = PARTS_AT_ONCE,
}: Deps): PrepareKeyPoints {
	async function writePart(job: Job, index: number, signal: AbortSignal) {
		signal.throwIfAborted();
		// a limit reached partway stops here, before more is spent
		await usage.requireRoom(job.userId);
		try {
			const result = await generateText({
				model: job.resolved.model,
				instructions: keyPointsInstructions,
				prompt: keyPointsPrompt({
					fileName: job.text.name,
					text: job.parts[index]!,
					index,
					total: job.parts.length,
				}),
				maxOutputTokens: KEY_POINTS_MAX_OUTPUT_TOKENS,
				timeout: KEY_POINTS_PART_TIMEOUT_MS,
				maxRetries: 1,
				abortSignal: signal,
				onStepEnd: trackStep({
					userId: job.userId,
					modelId: job.resolved.entry.id,
					action: 'keyPoints',
				}),
			});
			return cleanKeyPoints(result.text);
		} catch (error) {
			// a cancel is not a failure to log
			if (signal.aborted) throw error;
			logError(error);
			throw new ServiceUnavailableError(
				replyErrorMessage(error, NOTHING_WRITTEN)
			);
		}
	}

	// every part in order, a few at a time; one failed part stops the others, and
	// so does the student's Cancel
	async function writeSections(job: Job, { signal, onProgress }: KeyPointsRun) {
		const stop = new AbortController();
		const cancel = () => stop.abort(signal.reason);
		signal.addEventListener('abort', cancel, { once: true });
		if (signal.aborted) cancel();
		const release = takePlace(job.userId);
		let done = 0;
		try {
			return await mapLimit(job.parts, partsAtOnce, async (_, index) => {
				const section = await writePart(job, index, stop.signal);
				done += 1;
				onProgress(done, job.parts.length);
				return section;
			});
		} catch (error) {
			stop.abort();
			throw error;
		} finally {
			release();
			signal.removeEventListener('abort', cancel);
		}
	}

	async function writeNotes(job: Job, run: KeyPointsRun) {
		const sections = await writeSections(job, run);
		run.signal.throwIfAborted();
		const notes = keyPointNotes(job.text.name, sections);
		if (notes.length === 0) throw new ServiceUnavailableError(NOTHING_WRITTEN);
		const saved = await repo.insertPdfNotes(job.userId, job.topicId, notes, {
			name: job.text.name,
			hash: job.fileHash,
		});
		if (!saved) throw topicGone();
		return saved;
	}

	return async function prepareKeyPoints(
		userId,
		courseId,
		topicId,
		{ fileHash, modelId }
	) {
		if (!(await repo.topicExists(userId, courseId, topicId))) throw topicGone();
		// written before (the same file again, or two tabs): given back as they are
		const written = await repo.listPdfNotes(userId, topicId, fileHash);
		if (written.length > 0) return { total: 0, run: async () => written };
		const text = await repo.findPdfText(userId, topicId, fileHash);
		if (!text) throw new NotFoundError(PDF_GONE);
		const resolved = resolveModel(modelId, { thinking: false });
		await usage.requireRoom(userId);

		const job: Job = {
			userId,
			topicId,
			fileHash,
			text,
			parts: modelParts(text.parts),
			resolved,
		};
		return {
			total: job.parts.length,
			// the student reads a service's message; anything else is logged
			async run(run) {
				try {
					return await writeNotes(job, run);
				} catch (error) {
					if (run.signal.aborted || error instanceof AppError) throw error;
					logError(error);
					throw new ServiceUnavailableError(NOTHING_WRITTEN);
				}
			},
		};
	};
}

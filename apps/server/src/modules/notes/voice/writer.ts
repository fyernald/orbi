import type { Note, VoiceNoteMediaType } from '@orbi/shared';
import { generateText } from 'ai';
import type { ResolveModel } from '../../../ai/model-resolver';
import {
	AppError,
	NotFoundError,
	ServiceUnavailableError,
	ValidationError,
} from '../../../errors';
import { replyErrorMessage } from '../../tutor/reply-errors';
import type { TakePlace } from '../../tutor/reply-limiter';
import type { TrackStep } from '../../tutor/step-tracker';
import type { UsageService } from '../../usage/service';
import type { NoteRepository } from '../repository';
import { noteTitle } from '../title';
import {
	cleanVoiceText,
	modelMediaType,
	tidyInstructions,
	transcriptInstructions,
	VOICE_MAX_OUTPUT_TOKENS,
	VOICE_TIMEOUT_MS,
	voicePrompt,
} from './prompt';

const NOTHING_WRITTEN =
	'Orbi could not turn this recording into a note. Try again.';
const NO_SPEECH_HEARD =
	'Orbi could not hear any speech in this recording. Record again, closer to the microphone.';
const topicGone = () => new NotFoundError('Topic not found.');

export type VoiceNoteInput = {
	modelId: string;
	tidy: boolean;
	mediaType: VoiceNoteMediaType;
	audio: Uint8Array;
};

// A closed request (Cancel in the browser) stops the model; nothing is saved then
export type WriteVoiceNote = (
	userId: string,
	courseId: string,
	topicId: string,
	input: VoiceNoteInput,
	signal: AbortSignal
) => Promise<Note>;

type Deps = {
	repo: Pick<NoteRepository, 'topicExists' | 'insertNote'>;
	resolveModel: ResolveModel;
	// throws when the student is over an AI usage limit
	usage: Pick<UsageService, 'requireRoom'>;
	takePlace: TakePlace;
	trackStep: TrackStep;
	logError: (error: unknown) => void;
};

// Turns a recording into a note (US-47) with the model the student picked, never
// another one. The audio is only in memory for this request: it goes to the model
// once and is not kept, so only the note's text is saved.
export function createVoiceNoteWriter({
	repo,
	resolveModel,
	usage,
	takePlace,
	trackStep,
	logError,
}: Deps): WriteVoiceNote {
	return async function writeVoiceNote(
		userId,
		courseId,
		topicId,
		{ modelId, tidy, mediaType, audio },
		signal
	) {
		if (!(await repo.topicExists(userId, courseId, topicId))) throw topicGone();
		const { model, entry } = resolveModel(modelId, { thinking: false });
		if (!entry.audio) {
			throw new ValidationError(
				`${entry.label} cannot listen to recordings. Pick a model that can.`
			);
		}
		await usage.requireRoom(userId);

		const release = takePlace(userId);
		let text: string;
		try {
			const result = await generateText({
				model,
				instructions: tidy ? tidyInstructions : transcriptInstructions,
				messages: [
					{
						role: 'user',
						content: [
							{ type: 'text', text: voicePrompt(tidy) },
							{
								type: 'file',
								data: audio,
								mediaType: modelMediaType(mediaType),
							},
						],
					},
				],
				maxOutputTokens: VOICE_MAX_OUTPUT_TOKENS,
				timeout: VOICE_TIMEOUT_MS,
				maxRetries: 1,
				abortSignal: signal,
				onStepEnd: trackStep({
					userId,
					modelId: entry.id,
					action: 'voiceNote',
				}),
			});
			text = result.text;
		} catch (error) {
			// a cancel is not a failure to log
			if (signal.aborted || error instanceof AppError) throw error;
			logError(error);
			throw new ServiceUnavailableError(
				replyErrorMessage(error, NOTHING_WRITTEN)
			);
		} finally {
			release();
		}

		signal.throwIfAborted();
		const content = cleanVoiceText(text);
		if (!content) throw new ValidationError(NO_SPEECH_HEARD);
		const saved = await repo.insertNote(userId, topicId, {
			title: noteTitle(undefined, content),
			content,
		});
		if (!saved) throw topicGone();
		return saved;
	};
}

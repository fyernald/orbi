import type { AnswerExplanation } from '@orbi/shared';
import { generateText } from 'ai';
import type { ResolvedModel } from '../../ai/models';
import {
	NotFoundError,
	ServiceUnavailableError,
	ValidationError,
} from '../../errors';
import {
	cleanExplanation,
	EXPLANATION_MAX_OUTPUT_TOKENS,
	EXPLANATION_NOTES_MAX_LENGTH,
	explanationInstructions,
	explanationPrompt,
} from './explain-prompt';
import type { ExplanationRepository } from './explanation-repository';
import { selectNotes } from './prompt';
import { replyErrorMessage } from './reply-errors';
import type { TutorRepository } from './repository';
import type { TrackStep } from './step-tracker';

// a few sentences come back quickly; a slow model should not hold the session up
const EXPLANATION_TIMEOUT_MS = 30_000;

// Explains a wrong answer in a study session (US-07). Each question and choice is
// explained once: asking again gives back the saved text without a model call.
export function createAnswerExplainer({
	explanations,
	repo,
	resolveDefaultModel,
	requireRoom,
	takePlace,
	trackStep,
	logError,
}: {
	explanations: ExplanationRepository;
	repo: Pick<TutorRepository, 'listNotesForReply'>;
	// the server's default model, with Think off
	resolveDefaultModel: () => ResolvedModel;
	// throws when the student is over an AI usage limit
	requireRoom: (userId: string) => Promise<void>;
	// takes one of the student's places for a model call; the caller frees it
	takePlace: (userId: string) => () => void;
	trackStep: TrackStep;
	logError: (error: unknown) => void;
}) {
	return async function explainAnswer(
		userId: string,
		questionId: string,
		choice: number
	): Promise<AnswerExplanation> {
		const question = await explanations.findQuestion(userId, questionId);
		if (!question) throw new NotFoundError('Question not found.');
		if (choice >= question.choices.length) {
			throw new ValidationError("Pick one of the question's choices.");
		}
		if (choice === question.correctChoice) {
			throw new ValidationError('Only a wrong answer is explained.');
		}

		const saved = await explanations.findExplanation(
			userId,
			questionId,
			choice
		);
		if (saved) return { questionId, choice, text: saved };

		const resolved = resolveDefaultModel();
		await requireRoom(userId);
		const notes = await repo.listNotesForReply(
			userId,
			{ topicId: question.topicId },
			{ maxLength: EXPLANATION_NOTES_MAX_LENGTH, attachedIds: [] }
		);

		const release = takePlace(userId);
		let text: string | undefined;
		try {
			const result = await generateText({
				model: resolved.model,
				instructions: explanationInstructions({
					topicName: question.topicName,
					notes: selectNotes(
						notes.notes,
						EXPLANATION_NOTES_MAX_LENGTH,
						[],
						notes.total
					),
				}),
				prompt: explanationPrompt({ ...question, choice }),
				maxOutputTokens: EXPLANATION_MAX_OUTPUT_TOKENS,
				timeout: EXPLANATION_TIMEOUT_MS,
				maxRetries: 1,
				onStepEnd: trackStep({
					userId,
					modelId: resolved.entry.id,
					action: 'explainAnswer',
				}),
			});
			text = cleanExplanation(result.text);
		} catch (error) {
			logError(error);
			throw new ServiceUnavailableError(replyErrorMessage(error));
		} finally {
			release();
		}
		if (!text) {
			throw new ServiceUnavailableError(
				'Orbi could not explain this one. Try again.'
			);
		}

		const stored = await explanations.saveExplanation(userId, {
			questionId,
			choice,
			text,
			aiProvider: resolved.entry.provider,
			aiModel: resolved.entry.id,
		});
		return { questionId, choice, text: stored };
	};
}

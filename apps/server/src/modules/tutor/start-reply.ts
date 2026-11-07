import { randomUUID } from 'node:crypto';
import {
	tutorMessageMetadata,
	type SendChatMessageInput,
	type TutorMessageMetadata,
} from '@orbi/shared';
import {
	convertToModelMessages,
	isStepCount,
	smoothStream,
	streamText,
	toUIMessageStream,
	TypeValidationError,
	validateUIMessages,
	type InferUIMessageChunk,
} from 'ai';
import type { ResolvedModel } from '../../ai/models';
import { NotFoundError, ValidationError } from '../../errors';
import type { actionRules } from './actions';
import { chatTitle } from './chat-title';
import {
	attachedNoteIds,
	hasContent,
	HISTORY_LOADED,
	messageText,
	recentMessages,
	toStoredMessage,
	toUIMessage,
	withAttachmentNames,
	withoutEarlierThinking,
	withoutUnfinishedTools,
	type TutorUIMessage,
} from './messages';
import { nextMessages } from './next-messages';
import { ownAttachments } from './own-attachments';
import {
	buildInstructions,
	NOTES_CONTEXT_MAX_LENGTH,
	selectNotes,
} from './prompt';
import { replyErrorMessage, timeoutAsError } from './reply-errors';
import type {
	ChatRecord,
	CourseContext,
	TopicContext,
	TutorRepository,
} from './repository';
import type { TrackStep } from './step-tracker';
import { createThinkingClock, thinkingTimesOf } from './thinking-clock';
import { createTutorTools } from './tools';

export type TutorStream = ReadableStream<InferUIMessageChunk<TutorUIMessage>>;

// a tool loop: the tool call, maybe a retry after a bad tool input, then a short wrap-up
const MAX_STEPS = 4;

const TIMEOUT = {
	totalMs: 180_000,
	// the first token can be slow with long notes
	firstChunkMs: 60_000,
	chunkMs: 45_000,
};

// Some models send a reply in a few large pieces; this lets it appear word by word,
// with a short pause that only adds up when the model is faster than the reader
const SMOOTH_DELAY_MS = 12;

// Starts a reply the service has checked: saves the student's message, then
// streams the model's answer and saves it when it ends
export function createReplyStarter({
	repo,
	now,
	logError,
	trackStep,
}: {
	repo: TutorRepository;
	now: () => Date;
	logError: (error: unknown) => void;
	trackStep: TrackStep;
}) {
	return async function startReply({
		userId,
		chatId,
		input,
		chat,
		course,
		topic,
		resolved,
		rule,
		timeZone,
		abortSignal,
		release,
	}: {
		userId: string;
		chatId: string;
		input: SendChatMessageInput;
		chat: ChatRecord | undefined;
		course: CourseContext;
		topic: TopicContext | null;
		resolved: ResolvedModel;
		rule: Extract<
			(typeof actionRules)[keyof typeof actionRules],
			{ available: true }
		>;
		timeZone: string | null;
		abortSignal: AbortSignal;
		release: () => void;
	}): Promise<TutorStream> {
		const page = chat
			? await repo.listMessagePage(userId, chatId, { limit: HISTORY_LOADED })
			: { messages: [], hasEarlier: false };
		const history = page.messages.map(toUIMessage);

		const startedAt = now();
		const attachments = await ownAttachments(repo, userId, input);
		const { messages, studentMessage } = await nextMessages(
			repo,
			userId,
			chatId,
			input,
			{ messages: history, hasEarlier: page.hasEarlier },
			{
				topicId: topic?.id ?? null,
				action: input.action,
				attachments,
				createdAt: startedAt.toISOString(),
			}
		);

		const attachedIds = attachedNoteIds(messages);
		const loaded = await repo.listNotesForReply(
			userId,
			topic ? { topicId: topic.id } : { courseId: course.id },
			{ maxLength: NOTES_CONTEXT_MAX_LENGTH, attachedIds }
		);
		const scopeName = topic?.name ?? course.name;
		if (rule.needsNotes && loaded.total === 0) {
			throw new ValidationError(
				`Add notes to ${scopeName} first. Orbi makes questions from your notes.`
			);
		}
		const notes = selectNotes(
			loaded.notes,
			NOTES_CONTEXT_MAX_LENGTH,
			attachedIds,
			loaded.total
		);

		const continuing = messages.at(-1)?.role === 'assistant';
		const responseId = continuing ? messages.at(-1)!.id : randomUUID();
		const tools = createTutorTools({
			saveQuestions: (questions) => {
				// the tool is only offered in a topic's chat
				if (!topic) throw new Error('Questions need a topic.');
				return repo.insertQuestions(
					userId,
					topic.id,
					questions.map((item) => ({
						...item,
						aiProvider: resolved.entry.provider,
						aiModel: resolved.entry.id,
						chatMessageId: responseId,
					}))
				);
			},
		});

		let validated: TutorUIMessage[];
		try {
			validated = await validateUIMessages<TutorUIMessage>({
				messages,
				tools,
				metadataSchema: tutorMessageMetadata,
			});
		} catch (error) {
			if (TypeValidationError.isInstance(error)) {
				throw new ValidationError(
					'This chat could not be read. Start a new chat.'
				);
			}
			throw error;
		}

		// the student's message is kept even when the reply fails, so Try again works
		if (!chat) {
			const created = await repo.createChat(userId, {
				id: chatId,
				courseId: input.courseId,
				topicId: input.chatTopicId,
				title: chatTitle(messageText(studentMessage!), scopeName),
			});
			// the id belongs to another user's chat
			if (!created) throw new NotFoundError('Chat not found.');
		}
		if (studentMessage) {
			await repo.saveMessage(
				userId,
				chatId,
				toStoredMessage(studentMessage, startedAt)
			);
		}

		const forcedTool = continuing ? undefined : rule.tool;
		const result = streamText({
			model: resolved.model,
			instructions: buildInstructions({
				course,
				topic,
				student: await repo.findStudent(userId),
				notes,
				action: input.action,
				today: startedAt,
			}),
			messages: await convertToModelMessages(
				withAttachmentNames(recentMessages(withoutEarlierThinking(validated))),
				{ tools }
			),
			tools,
			// practice questions belong to a topic, so the whole-course chat cannot make them
			activeTools: topic ? undefined : ['askStudent', 'createDiagram'],
			// a forced tool stays forced until it worked once, so a bad input gets a retry
			prepareStep: forcedTool
				? ({ steps }) => {
						const done = steps.some((step) =>
							step.toolResults.some(
								(toolResult) => toolResult.toolName === forcedTool
							)
						);
						return {
							toolChoice: done
								? 'none'
								: { type: 'tool', toolName: forcedTool },
						};
					}
				: undefined,
			stopWhen: isStepCount(MAX_STEPS),
			experimental_transform: smoothStream({
				chunking: 'word',
				delayInMs: SMOOTH_DELAY_MS,
			}),
			abortSignal,
			timeout: TIMEOUT,
			maxRetries: 1,
			onStepEnd: trackStep({
				userId,
				timeZone,
				modelId: resolved.entry.id,
				action: input.action,
			}),
		});

		// a millisecond after the student's message, so the two never swap places
		const replyAt = new Date(startedAt.getTime() + 1).toISOString();
		const replyMetadata: TutorMessageMetadata = {
			topicId: topic?.id ?? null,
			action: input.action,
			modelId: resolved.entry.id,
			notesUsed: notes.notes.length,
			notesTotal: notes.total,
			notesCut: notes.cut,
			createdAt: continuing
				? (messages.at(-1)!.metadata?.createdAt ?? replyAt)
				: replyAt,
		};
		const thinking = createThinkingClock(
			now,
			continuing ? thinkingTimesOf(messages.at(-1)!) : []
		);
		const currentMetadata = (): TutorMessageMetadata => ({
			...replyMetadata,
			thinkingMs: thinking.times(),
		});

		const stream = toUIMessageStream<typeof tools, TutorUIMessage>({
			stream: result.stream,
			tools,
			originalMessages: validated,
			generateMessageId: () => responseId,
			// with Think off nothing is shown, even from a model that cannot stop thinking
			sendReasoning: input.thinking,
			// sent again after each thinking part, so the student sees how long it took
			messageMetadata: ({ part }) => {
				thinking.track(part);
				return part.type === 'start' || part.type === 'reasoning-end'
					? currentMetadata()
					: undefined;
			},
			onError: (error) => {
				logError(error);
				return replyErrorMessage(error);
			},
			// a reply the student stopped is kept up to where it got; one cut by the
			// timeout is not, so Try again starts it fresh
			onEnd: async ({ responseMessage, isAborted }) => {
				release();
				if (isAborted && !abortSignal.aborted) return;
				const reply = withoutUnfinishedTools({
					...responseMessage,
					metadata: currentMetadata(),
				});
				if (!hasContent(reply)) return;
				try {
					await repo.saveMessage(
						userId,
						chatId,
						toStoredMessage(reply, startedAt)
					);
				} catch (error) {
					logError(error);
				}
			},
		});
		// the timeout also ends the stream with an abort, which the chat would show as
		// "You stopped this reply"; it becomes an error with Try again instead
		return stream.pipeThrough(
			new TransformStream({
				transform(chunk, controller) {
					controller.enqueue(timeoutAsError(chunk, abortSignal.aborted));
				},
				flush: () => release(),
			})
		);
	};
}

import { randomUUID } from 'node:crypto';
import {
	CHAT_PAGE_SIZE,
	MAX_PARALLEL_REPLIES,
	TUTOR_MESSAGE_MAX_LENGTH,
	tutorMessageMetadata,
	type AiModels,
	type ChatMessagesPage,
	type ChatSummary,
	type ChatThread,
	type SendChatMessageInput,
	type TutorMessageMetadata,
} from '@orbi/shared';
import {
	APICallError,
	convertToModelMessages,
	isStepCount,
	RetryError,
	smoothStream,
	streamText,
	toUIMessageStream,
	TypeValidationError,
	validateUIMessages,
	type InferUIMessageChunk,
} from 'ai';
import type { ModelRegistry, ResolvedModel } from '../../ai/models';
import {
	ConflictError,
	NotFoundError,
	ServiceUnavailableError,
	TooManyRequestsError,
	ValidationError,
} from '../../errors';
import { actionRules } from './actions';
import { chatTitle } from './chat-title';
import {
	hasContent,
	messageText,
	skipUnansweredQuestions,
	toChatMessage,
	toStoredMessage,
	toUIMessage,
	withoutUnfinishedTools,
	type TutorUIMessage,
} from './messages';
import { buildInstructions, selectNotes } from './prompt';
import { createReplyLimiter, type ReplyLimiter } from './reply-limiter';
import type {
	ChatRecord,
	CourseContext,
	StoredMessage,
	TopicContext,
	TutorRepository,
} from './repository';
import { createTutorTools } from './tools';

export type TutorStream = ReadableStream<InferUIMessageChunk<TutorUIMessage>>;

export interface TutorService {
	listModels(): AiModels;
	listChats(userId: string, courseId: string): Promise<ChatSummary[]>;
	// the chat with its newest messages
	getChat(userId: string, chatId: string): Promise<ChatThread>;
	getEarlierMessages(
		userId: string,
		chatId: string,
		beforeId: string
	): Promise<ChatMessagesPage>;
	// checks everything first, so a bad request answers with a normal error, then streams
	reply(
		userId: string,
		chatId: string,
		input: SendChatMessageInput,
		abortSignal: AbortSignal
	): Promise<TutorStream>;
}

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

// the student sees this text; provider details go to the log only
export function replyErrorMessage(error: unknown): string {
	// after its retries the AI SDK wraps the provider's error
	const cause = RetryError.isInstance(error) ? error.lastError : error;
	if (
		cause instanceof Error &&
		['TimeoutError', 'AbortError'].includes(cause.name)
	) {
		return 'Orbi took too long to answer. Try again.';
	}
	if (APICallError.isInstance(cause)) {
		const status = cause.statusCode ?? 0;
		// a short rate limit and a used-up daily quota both answer 429
		if (status === 429) {
			return 'This model has reached its limit for now. Try again later, or pick another model.';
		}
		if (status === 403 || status === 404) {
			return 'This model is not available right now. Pick another model.';
		}
		if (status >= 500) {
			return 'The AI service is having problems. Try again in a minute.';
		}
	}
	return 'Orbi could not answer. Try again.';
}

const toPage = ({
	messages,
	hasEarlier,
}: {
	messages: StoredMessage[];
	hasEarlier: boolean;
}): ChatMessagesPage => ({
	messages: messages.map(toUIMessage).map(toChatMessage),
	hasEarlier,
});

const toSummary = (chat: ChatRecord): ChatSummary => ({
	id: chat.id,
	courseId: chat.courseId,
	topicId: chat.topicId,
	title: chat.title,
	updatedAt: chat.updatedAt.toISOString(),
});

export function createTutorService({
	repo,
	models,
	limiter = createReplyLimiter(MAX_PARALLEL_REPLIES),
	logError = (error) => console.error(error),
	now = () => new Date(),
}: {
	repo: TutorRepository;
	models: ModelRegistry;
	limiter?: ReplyLimiter;
	logError?: (error: unknown) => void;
	now?: () => Date;
}): TutorService {
	function resolveModel(modelId: string): ResolvedModel {
		const resolved = models.resolve(modelId);
		if (resolved) return resolved;
		if (models.list().models.length === 0) {
			throw new ServiceUnavailableError(
				'The AI tutor is not set up on this server yet.'
			);
		}
		throw new ValidationError('Choose a model from the list.');
	}

	async function requireChat(userId: string, chatId: string) {
		const chat = await repo.findChat(userId, chatId);
		if (!chat) throw new NotFoundError('Chat not found.');
		return chat;
	}

	// the messages the model sees, and the student's new message to save first
	async function nextMessages(
		userId: string,
		chatId: string,
		input: SendChatMessageInput,
		history: TutorUIMessage[],
		metadata: TutorMessageMetadata
	): Promise<{ messages: TutorUIMessage[]; studentMessage?: TutorUIMessage }> {
		if (input.trigger === 'regenerate-message') {
			const lastStudent = history.map(({ role }) => role).lastIndexOf('user');
			if (lastStudent === -1) {
				throw new ValidationError('There is nothing to try again.');
			}
			const dropped = history.slice(lastStudent + 1).map(({ id }) => id);
			await repo.deleteMessages(userId, chatId, dropped);
			return { messages: history.slice(0, lastStudent + 1) };
		}

		const incoming = input.message!;
		if (incoming.role === 'assistant') {
			// the last reply comes back with the student's answer to askStudent
			const last = history.at(-1);
			if (!last || last.id !== incoming.id || last.role !== 'assistant') {
				throw new ValidationError('Only the last reply can go on.');
			}
			const continued = {
				...incoming,
				metadata: last.metadata,
			} as TutorUIMessage;
			return { messages: [...history.slice(0, -1), continued] };
		}

		const sentBefore = history.findIndex(({ id }) => id === incoming.id);
		if (sentBefore !== -1) {
			// the student's last message again, after a failed reply: try it again
			const lastStudent = history.map(({ role }) => role).lastIndexOf('user');
			if (sentBefore !== lastStudent) {
				throw new ConflictError('This message was already sent.');
			}
			const dropped = history.slice(sentBefore + 1).map(({ id }) => id);
			await repo.deleteMessages(userId, chatId, dropped);
			return { messages: history.slice(0, sentBefore + 1) };
		}
		const studentMessage = { ...incoming, metadata } as TutorUIMessage;
		const text = messageText(studentMessage);
		if (!text) throw new ValidationError('Write a message first.');
		if (text.length > TUTOR_MESSAGE_MAX_LENGTH) {
			throw new ValidationError(
				`Use at most ${TUTOR_MESSAGE_MAX_LENGTH.toLocaleString('en')} characters.`
			);
		}

		const last = history.at(-1);
		const skipped = last && skipUnansweredQuestions(last);
		if (skipped) {
			await repo.saveMessage(
				userId,
				chatId,
				toStoredMessage(skipped, new Date(metadata.createdAt))
			);
			history = [...history.slice(0, -1), skipped];
		}
		return { messages: [...history, studentMessage], studentMessage };
	}

	return {
		listModels: () => models.list(),

		async listChats(userId, courseId) {
			if (!(await repo.courseExists(userId, courseId))) {
				throw new NotFoundError('Course not found.');
			}
			return (await repo.listChats(userId, courseId)).map(toSummary);
		},

		async getChat(userId, chatId) {
			const chat = await requireChat(userId, chatId);
			const page = await repo.listMessagePage(userId, chatId, {
				limit: CHAT_PAGE_SIZE,
			});
			return { ...toSummary(chat), ...toPage(page) };
		},

		async getEarlierMessages(userId, chatId, beforeId) {
			await requireChat(userId, chatId);
			const page = await repo.listMessagePage(userId, chatId, {
				beforeId,
				limit: CHAT_PAGE_SIZE,
			});
			return toPage(page);
		},

		async reply(userId, chatId, input, abortSignal) {
			const rule = actionRules[input.action];
			if (!rule.available) throw new ValidationError(rule.message);
			const resolved = resolveModel(input.modelId);

			const course = await repo.findCourse(userId, input.courseId);
			if (!course) throw new NotFoundError('Course not found.');
			// null in the whole-course chat
			let topic: TopicContext | null = null;
			if (input.topicId) {
				topic =
					(await repo.findTopic(userId, input.courseId, input.topicId)) ?? null;
				if (!topic) throw new NotFoundError('Topic not found.');
			}
			// questions are saved to one topic
			if (rule.tool && !topic) {
				throw new ValidationError(
					'Pick a topic first. Practice questions belong to one topic.'
				);
			}

			const chat = await repo.findChat(userId, chatId);
			// another user's chat, or a chat of another course or topic, answers like a missing one
			if (
				chat &&
				(chat.courseId !== input.courseId || chat.topicId !== input.chatTopicId)
			) {
				throw new NotFoundError('Chat not found.');
			}
			if (!chat && input.trigger !== 'submit-message') {
				throw new NotFoundError('Chat not found.');
			}

			// taken before anything is saved, so a refused message leaves no trace
			const release = limiter.acquire(userId);
			if (!release) {
				throw new TooManyRequestsError(
					`You can have ${MAX_PARALLEL_REPLIES} replies running at once. Wait for one to finish.`
				);
			}
			try {
				return await startReply({
					userId,
					chatId,
					input,
					chat,
					course,
					topic,
					resolved,
					rule,
					abortSignal,
					release,
				});
			} catch (error) {
				release();
				throw error;
			}
		},
	};

	async function startReply({
		userId,
		chatId,
		input,
		chat,
		course,
		topic,
		resolved,
		rule,
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
		abortSignal: AbortSignal;
		release: () => void;
	}): Promise<TutorStream> {
		const history = chat
			? (await repo.listMessages(userId, chatId)).map(toUIMessage)
			: [];

		const startedAt = now();
		const { messages, studentMessage } = await nextMessages(
			userId,
			chatId,
			input,
			history,
			{
				topicId: topic?.id ?? null,
				action: input.action,
				createdAt: startedAt.toISOString(),
			}
		);

		const allNotes = topic
			? await repo.listNotes(userId, topic.id)
			: await repo.listCourseNotes(userId, course.id);
		const scopeName = topic?.name ?? course.name;
		if (rule.needsNotes && allNotes.length === 0) {
			throw new ValidationError(
				`Add notes to ${scopeName} first. Orbi makes questions from your notes.`
			);
		}
		const notes = selectNotes(allNotes);

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
			messages: await convertToModelMessages(validated, { tools }),
			tools,
			// practice questions belong to a topic, so the whole-course chat cannot make them
			activeTools: topic ? undefined : ['askStudent'],
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
		});

		// a millisecond after the student's message, so the two never swap places
		const replyAt = new Date(startedAt.getTime() + 1).toISOString();
		const replyMetadata: TutorMessageMetadata = {
			topicId: topic?.id ?? null,
			action: input.action,
			modelId: resolved.entry.id,
			notesUsed: notes.notes.length,
			createdAt: continuing
				? (messages.at(-1)!.metadata?.createdAt ?? replyAt)
				: replyAt,
		};

		// a reply ends by finishing, failing, or being stopped; each frees its place
		abortSignal.addEventListener('abort', release, { once: true });
		const stream = toUIMessageStream<typeof tools, TutorUIMessage>({
			stream: result.stream,
			tools,
			originalMessages: validated,
			generateMessageId: () => responseId,
			messageMetadata: ({ part }) =>
				part.type === 'start' ? replyMetadata : undefined,
			onError: (error) => {
				logError(error);
				return replyErrorMessage(error);
			},
			// a stopped reply is kept up to where it got
			onEnd: async ({ responseMessage }) => {
				release();
				const reply = withoutUnfinishedTools({
					...responseMessage,
					metadata: replyMetadata,
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
		return stream.pipeThrough(new TransformStream({ flush: () => release() }));
	}
}

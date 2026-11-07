import {
	CHAT_PAGE_SIZE,
	MAX_PARALLEL_REPLIES,
	type AiModels,
	type AnswerExplanation,
	type ChatMessagesPage,
	type ChatSummary,
	type ChatThread,
	type FollowUps,
	type FollowUpsInput,
	type RenameChatInput,
	type SendChatMessageInput,
} from '@orbi/shared';
import { generateText } from 'ai';
import {
	createTokenBudget,
	DAILY_TOKENS_DEFAULT,
	type TokenBudget,
} from '../../ai/budget';
import type {
	ModelOptions,
	ModelRegistry,
	ResolvedModel,
} from '../../ai/models';
import type { LogUsage } from '../../ai/usage';
import {
	NotFoundError,
	ServiceUnavailableError,
	TooManyRequestsError,
	ValidationError,
} from '../../errors';
import { actionRules } from './actions';
import { createAnswerExplainer } from './answer-explainer';
import type { ExplanationRepository } from './explanation-repository';
import {
	cleanFollowUps,
	FOLLOW_UP_NOTES_MAX_LENGTH,
	followUpInstructions,
	followUpPrompt,
	suggestFollowUpsTool,
} from './follow-ups';
import {
	attachedNoteIds,
	isExplanation,
	messageText,
	toChatMessage,
	toUIMessage,
	withAttachmentNames,
} from './messages';
import { selectNotes } from './prompt';
import { replyErrorMessage } from './reply-errors';
import {
	createReplyLimiter,
	releaseOnAbort,
	type ReplyLimiter,
} from './reply-limiter';
import type {
	ChatRecord,
	StoredMessage,
	TopicContext,
	TutorRepository,
} from './repository';
import { createReplyStarter, type TutorStream } from './start-reply';
import { createStepTracker } from './step-tracker';

export interface TutorService {
	listModels(): AiModels;
	listChats(userId: string, courseId: string): Promise<ChatSummary[]>;
	// the chat with its newest messages
	getChat(userId: string, chatId: string): Promise<ChatThread>;
	renameChat(
		userId: string,
		chatId: string,
		input: RenameChatInput
	): Promise<ChatSummary>;
	deleteChat(userId: string, chatId: string): Promise<void>;
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
	// a few questions that go deeper into the latest reply, from the model that wrote it
	suggestFollowUps(
		userId: string,
		chatId: string,
		messageId: string,
		input: FollowUpsInput
	): Promise<FollowUps>;
	// why a wrong choice in a study session is wrong, from the topic's notes (US-07)
	explainAnswer(
		userId: string,
		questionId: string,
		choice: number
	): Promise<AnswerExplanation>;
}

const FOLLOW_UPS_TIMEOUT_MS = 30_000;

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
	explanations,
	models,
	limiter = createReplyLimiter(MAX_PARALLEL_REPLIES),
	budget = createTokenBudget({ dailyTokens: DAILY_TOKENS_DEFAULT }),
	logError = (error) => console.error(error),
	logUsage = () => {},
	now = () => new Date(),
}: {
	repo: TutorRepository;
	explanations: ExplanationRepository;
	models: ModelRegistry;
	limiter?: ReplyLimiter;
	budget?: TokenBudget;
	logError?: (error: unknown) => void;
	logUsage?: LogUsage;
	now?: () => Date;
}): TutorService {
	function resolveModel(modelId: string, options: ModelOptions): ResolvedModel {
		const resolved = models.resolve(modelId, options);
		if (resolved) return resolved;
		if (models.list().models.length === 0) {
			throw new ServiceUnavailableError(
				'The AI tutor is not set up on this server yet.'
			);
		}
		throw new ValidationError('Choose a model from the list.');
	}

	// Every model call takes one of the student's places, so neither replies nor
	// follow-up questions can run past the limit; the caller frees it when done
	function takePlace(userId: string) {
		const release = limiter.acquire(userId);
		if (!release) {
			throw new TooManyRequestsError(
				`You can have ${MAX_PARALLEL_REPLIES} replies running at once. Wait for one to finish.`
			);
		}
		return release;
	}

	async function requireChat(userId: string, chatId: string) {
		const chat = await repo.findChat(userId, chatId);
		if (!chat) throw new NotFoundError('Chat not found.');
		return chat;
	}

	// A student whose daily AI budget is used up gets no new model call. Gives the
	// student's time zone, since their day decides when the budget starts again.
	async function requireBudget(userId: string) {
		const timeZone = await repo.findTimeZone(userId);
		if (!budget.hasLeft(userId, timeZone)) {
			throw new TooManyRequestsError(
				"You have used today's AI budget. It resets at midnight."
			);
		}
		return timeZone;
	}

	const trackStep = createStepTracker({ logUsage, budget });
	const startReply = createReplyStarter({ repo, now, logError, trackStep });
	const explainAnswer = createAnswerExplainer({
		explanations,
		repo,
		// a study session has no model picker, and a few sentences need no thinking
		resolveDefaultModel: () =>
			resolveModel(models.list().defaultModelId ?? '', { thinking: false }),
		requireBudget,
		takePlace,
		trackStep,
		logError,
	});

	return {
		listModels: () => models.list(),

		explainAnswer,

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

		async renameChat(userId, chatId, { title }) {
			const renamed = await repo.renameChat(userId, chatId, title);
			if (!renamed) throw new NotFoundError('Chat not found.');
			return toSummary(renamed);
		},

		async deleteChat(userId, chatId) {
			if (!(await repo.deleteChat(userId, chatId))) {
				throw new NotFoundError('Chat not found.');
			}
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
			const resolved = resolveModel(input.modelId, {
				thinking: input.thinking,
			});
			const timeZone = await requireBudget(userId);

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
			const release = takePlace(userId);
			// a reply ends by finishing, failing, or being stopped; each frees its place.
			// Watched from here, because the student can stop while the reply is set up.
			releaseOnAbort(release, abortSignal);
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
					timeZone,
					abortSignal,
					release,
				});
			} catch (error) {
				release();
				throw error;
			}
		},

		async suggestFollowUps(userId, chatId, messageId, { exclude }) {
			const chat = await requireChat(userId, chatId);
			const { messages } = await repo.listMessagePage(userId, chatId, {
				limit: 2,
			});
			const [before, reply] = messages.map(toUIMessage);
			if (!reply || reply.id !== messageId) {
				throw new ValidationError(
					"Follow-up questions are only for Orbi's latest reply."
				);
			}
			if (!isExplanation(reply)) return { questions: [] };
			// saved ones come back without asking the model; a refresh asks again
			const saved = reply.metadata?.followUps;
			if (saved && exclude.length === 0) return { questions: saved };
			// the questions only need the answer, so the model does not think first
			const resolved = resolveModel(reply.metadata?.modelId ?? '', {
				thinking: false,
			});
			const timeZone = await requireBudget(userId);

			const course = await repo.findCourse(userId, chat.courseId);
			if (!course) throw new NotFoundError('Course not found.');
			const topicId = reply.metadata?.topicId;
			const topic = topicId
				? await repo.findTopic(userId, course.id, topicId)
				: undefined;
			const attachedIds = before ? attachedNoteIds([before]) : [];
			const notes = await repo.listNotesForReply(
				userId,
				topic ? { topicId: topic.id } : { courseId: course.id },
				{ maxLength: FOLLOW_UP_NOTES_MAX_LENGTH, attachedIds }
			);

			const release = takePlace(userId);
			let questions: string[];
			try {
				const result = await generateText({
					model: resolved.model,
					instructions: followUpInstructions({
						scopeName: topic?.name ?? course.name,
						notes: selectNotes(
							notes.notes,
							FOLLOW_UP_NOTES_MAX_LENGTH,
							attachedIds,
							notes.total
						),
						exclude,
					}),
					prompt: followUpPrompt(
						// with the names of the PDFs the student sent, if any
						before?.role === 'user'
							? messageText(withAttachmentNames([before])[0]!)
							: '',
						messageText(reply)
					),
					tools: { suggestFollowUps: suggestFollowUpsTool },
					toolChoice: { type: 'tool', toolName: 'suggestFollowUps' },
					timeout: FOLLOW_UPS_TIMEOUT_MS,
					maxRetries: 1,
					onStepEnd: trackStep({
						userId,
						timeZone,
						modelId: resolved.entry.id,
						action: 'followUps',
					}),
				});
				questions = cleanFollowUps(result.toolCalls[0]?.input, exclude);
			} catch (error) {
				logError(error);
				throw new ServiceUnavailableError(replyErrorMessage(error));
			} finally {
				release();
			}
			// also when there are none, so the model is not asked again
			await repo.saveFollowUps(userId, chatId, reply.id, questions);
			return { questions };
		},
	};
}

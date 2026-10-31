import { z } from 'zod';

export const TUTOR_ACTIONS = [
	'ask',
	'questions',
	'flashcards',
	'mockExam',
] as const;

export const TUTOR_MESSAGE_MAX_LENGTH = 20_000;
export const CHAT_TITLE_MAX_LENGTH = 120;

// what the composer sends to the tutor; the attached files get their own field
// when the upload endpoint is built
export const tutorRequestInput = z.object({
	action: z.enum(TUTOR_ACTIONS),
	// empty means the whole course; the composer decides when that is allowed
	topicId: z.string(),
	modelId: z.string().min(1, 'Choose a model first.'),
	message: z
		.string()
		.trim()
		.max(
			TUTOR_MESSAGE_MAX_LENGTH,
			`Use at most ${TUTOR_MESSAGE_MAX_LENGTH.toLocaleString('en')} characters.`
		),
});

export const chatParams = z.object({ chatId: z.uuid('Chat not found.') });

// saved with every message, so the history shows what each one was about
export const tutorMessageMetadata = z.object({
	topicId: z.uuid().nullable(),
	action: z.enum(TUTOR_ACTIONS).optional(),
	modelId: z.string().optional(),
	// how many of the topic's notes the tutor read for this reply
	notesUsed: z.int().optional(),
	createdAt: z.iso.datetime(),
});

// a chat message in the AI SDK's UIMessage shape; the parts are checked again on the
// server with validateUIMessages, which knows every part type and tool
export const chatMessage = z.object({
	id: z.uuid(),
	role: z.enum(['user', 'assistant']),
	parts: z.array(z.looseObject({ type: z.string() })),
	metadata: tutorMessageMetadata.optional(),
});

export const CHAT_TRIGGERS = ['submit-message', 'regenerate-message'] as const;

// how many replies a student can have running at once, across all their chats
export const MAX_PARALLEL_REPLIES = 3;

// a new message, or a retry of the last reply; the server keeps the history
export const sendChatMessageInput = z
	.object({
		courseId: z.uuid('Course not found.'),
		// the topic the chat belongs to, or null for the whole-course chat
		chatTopicId: z.uuid('Topic not found.').nullable(),
		// the topic this message is about: in a topic's chat that topic, in the
		// whole-course chat null
		topicId: z.uuid('Topic not found.').nullable(),
		modelId: z.string().min(1, 'Choose a model first.'),
		action: z.enum(TUTOR_ACTIONS),
		trigger: z.enum(CHAT_TRIGGERS),
		message: chatMessage.omit({ metadata: true }).optional(),
	})
	.refine(
		(input) => input.trigger !== 'submit-message' || input.message,
		'Write a message first.'
	)
	.refine(
		(input) =>
			input.chatTopicId === null || input.chatTopicId === input.topicId,
		"A topic's chat can only be about that topic."
	);

export const chatSummary = z.object({
	id: z.uuid(),
	courseId: z.uuid(),
	topicId: z.uuid().nullable(),
	title: z.string(),
	updatedAt: z.iso.datetime(),
});

// a chat opens on its newest messages; older ones load as the student scrolls up
export const CHAT_PAGE_SIZE = 30;

export const chatMessagesPage = z.object({
	messages: z.array(chatMessage),
	hasEarlier: z.boolean(),
});

export const chatThread = chatSummary.extend(chatMessagesPage.shape);

export const earlierMessagesQuery = z.object({
	before: z.uuid('Message not found.'),
});

export type TutorAction = (typeof TUTOR_ACTIONS)[number];
export type TutorRequestInput = z.infer<typeof tutorRequestInput>;
export type TutorMessageMetadata = z.infer<typeof tutorMessageMetadata>;
export type ChatMessage = z.infer<typeof chatMessage>;
export type SendChatMessageInput = z.infer<typeof sendChatMessageInput>;
export type ChatSummary = z.infer<typeof chatSummary>;
export type ChatThread = z.infer<typeof chatThread>;
export type ChatMessagesPage = z.infer<typeof chatMessagesPage>;

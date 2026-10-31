import type {
	AiProvider,
	CourseGoal,
	EducationLevel,
	ExplanationStyle,
	GeneratedQuestion,
	TutorAction,
} from '@orbi/shared';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import type { Db } from '../../db';
import {
	chat,
	chatMessage,
	course,
	note,
	profile,
	question,
	topic,
} from '../../db/schema';

export type TopicContext = {
	id: string;
	name: string;
	courseId: string;
	courseName: string;
	courseGoal: CourseGoal;
	examDate: string | null;
};

export type CourseContext = {
	id: string;
	name: string;
	goal: CourseGoal;
	examDate: string | null;
};

export type StudentContext = {
	preferredName: string | null;
	educationLevel: EducationLevel | null;
	fieldOfStudy: string | null;
	explanationStyle: ExplanationStyle | null;
	locale: string | null;
};

export type NoteForTutor = {
	id: string;
	title: string;
	// set for notes of the whole course, so the model knows where each comes from
	topicName?: string;
	content: string;
	createdAt: Date;
};

export type ChatRecord = {
	id: string;
	courseId: string;
	// null for the whole-course chat
	topicId: string | null;
	title: string;
	updatedAt: Date;
};

export type StoredMessage = {
	id: string;
	role: 'user' | 'assistant';
	parts: Record<string, unknown>[];
	topicId: string | null;
	action: TutorAction | null;
	modelId: string | null;
	notesUsed: number | null;
	createdAt: Date;
};

export type NewQuestion = GeneratedQuestion & {
	aiProvider: AiProvider;
	aiModel: string;
	chatMessageId: string;
};

export interface TutorRepository {
	courseExists(userId: string, courseId: string): Promise<boolean>;
	findCourse(
		userId: string,
		courseId: string
	): Promise<CourseContext | undefined>;
	findTopic(
		userId: string,
		courseId: string,
		topicId: string
	): Promise<TopicContext | undefined>;
	findStudent(userId: string): Promise<StudentContext | undefined>;
	listNotes(userId: string, topicId: string): Promise<NoteForTutor[]>;
	// every note of the course, newest first, for the whole-course chat
	listCourseNotes(userId: string, courseId: string): Promise<NoteForTutor[]>;
	findChat(userId: string, chatId: string): Promise<ChatRecord | undefined>;
	listChats(userId: string, courseId: string): Promise<ChatRecord[]>;
	// undefined when the id is already taken, by any user
	createChat(
		userId: string,
		input: {
			id: string;
			courseId: string;
			topicId: string | null;
			title: string;
		}
	): Promise<ChatRecord | undefined>;
	listMessages(userId: string, chatId: string): Promise<StoredMessage[]>;
	// the newest messages before one message (or the newest of all), oldest first
	listMessagePage(
		userId: string,
		chatId: string,
		page: { beforeId?: string; limit: number }
	): Promise<{ messages: StoredMessage[]; hasEarlier: boolean }>;
	saveMessage(
		userId: string,
		chatId: string,
		message: StoredMessage
	): Promise<void>;
	deleteMessages(userId: string, chatId: string, ids: string[]): Promise<void>;
	insertQuestions(
		userId: string,
		topicId: string,
		questions: NewQuestion[]
	): Promise<string[]>;
}

// the newest chats first; older ones get a history list later
const CHATS_LISTED = 50;

const chatColumns = {
	id: chat.id,
	courseId: chat.courseId,
	topicId: chat.topicId,
	title: chat.title,
	updatedAt: chat.updatedAt,
};

const messageColumns = {
	id: chatMessage.id,
	role: chatMessage.role,
	parts: chatMessage.parts,
	topicId: chatMessage.topicId,
	action: chatMessage.action,
	modelId: chatMessage.modelId,
	notesUsed: chatMessage.notesUsed,
	createdAt: chatMessage.createdAt,
};

export function createTutorRepository(db: Db): TutorRepository {
	return {
		async courseExists(userId, courseId) {
			const [found] = await db
				.select({ id: course.id })
				.from(course)
				.where(and(eq(course.userId, userId), eq(course.id, courseId)));
			return found !== undefined;
		},

		async findCourse(userId, courseId) {
			const [found] = await db
				.select({
					id: course.id,
					name: course.name,
					goal: course.goal,
					examDate: course.examDate,
				})
				.from(course)
				.where(and(eq(course.userId, userId), eq(course.id, courseId)));
			return found;
		},

		listCourseNotes(userId, courseId) {
			return db
				.select({
					id: note.id,
					title: note.title,
					topicName: topic.name,
					content: note.content,
					createdAt: note.createdAt,
				})
				.from(note)
				.innerJoin(topic, eq(topic.id, note.topicId))
				.where(and(eq(note.userId, userId), eq(topic.courseId, courseId)))
				.orderBy(desc(note.createdAt), desc(note.id));
		},

		async findTopic(userId, courseId, topicId) {
			const [found] = await db
				.select({
					id: topic.id,
					name: topic.name,
					courseId: course.id,
					courseName: course.name,
					courseGoal: course.goal,
					examDate: course.examDate,
				})
				.from(topic)
				.innerJoin(course, eq(course.id, topic.courseId))
				.where(
					and(
						eq(topic.userId, userId),
						eq(topic.courseId, courseId),
						eq(topic.id, topicId)
					)
				);
			return found;
		},

		async findStudent(userId) {
			const [found] = await db
				.select({
					preferredName: profile.preferredName,
					educationLevel: profile.educationLevel,
					fieldOfStudy: profile.fieldOfStudy,
					explanationStyle: profile.explanationStyle,
					locale: profile.locale,
				})
				.from(profile)
				.where(eq(profile.userId, userId));
			return found;
		},

		// newest first, so the tutor keeps the latest notes when there are too many
		listNotes(userId, topicId) {
			return db
				.select({
					id: note.id,
					title: note.title,
					content: note.content,
					createdAt: note.createdAt,
				})
				.from(note)
				.where(and(eq(note.userId, userId), eq(note.topicId, topicId)))
				.orderBy(desc(note.createdAt), desc(note.id));
		},

		async findChat(userId, chatId) {
			const [found] = await db
				.select(chatColumns)
				.from(chat)
				.where(and(eq(chat.userId, userId), eq(chat.id, chatId)));
			return found;
		},

		listChats(userId, courseId) {
			return db
				.select(chatColumns)
				.from(chat)
				.where(and(eq(chat.userId, userId), eq(chat.courseId, courseId)))
				.orderBy(desc(chat.updatedAt), desc(chat.id))
				.limit(CHATS_LISTED);
		},

		async createChat(userId, input) {
			const [created] = await db
				.insert(chat)
				.values({ userId, ...input })
				.onConflictDoNothing({ target: chat.id })
				.returning(chatColumns);
			return created;
		},

		listMessages(userId, chatId) {
			return db
				.select(messageColumns)
				.from(chatMessage)
				.where(
					and(eq(chatMessage.userId, userId), eq(chatMessage.chatId, chatId))
				)
				.orderBy(asc(chatMessage.createdAt), asc(chatMessage.id));
		},

		async listMessagePage(userId, chatId, { beforeId, limit }) {
			// messages that come before the given one, in the same order as the chat
			const before = beforeId
				? sql`(${chatMessage.createdAt}, ${chatMessage.id}) < (select m.created_at, m.id from chat_message m where m.id = ${beforeId} and m.chat_id = ${chatId})`
				: undefined;
			const rows = await db
				.select(messageColumns)
				.from(chatMessage)
				.where(
					and(
						eq(chatMessage.userId, userId),
						eq(chatMessage.chatId, chatId),
						before
					)
				)
				.orderBy(desc(chatMessage.createdAt), desc(chatMessage.id))
				// one more than asked, to know whether there are earlier ones
				.limit(limit + 1);
			return {
				messages: rows.slice(0, limit).reverse(),
				hasEarlier: rows.length > limit,
			};
		},

		// a reply that continues (after the student answers a question) replaces itself;
		// the chat moves to the top of the list
		async saveMessage(userId, chatId, message) {
			await db.transaction(async (tx) => {
				await tx
					.insert(chatMessage)
					.values({ userId, chatId, ...message })
					.onConflictDoUpdate({
						target: chatMessage.id,
						set: { parts: message.parts, updatedAt: new Date() },
						setWhere: and(
							eq(chatMessage.userId, userId),
							eq(chatMessage.chatId, chatId)
						),
					});
				await tx
					.update(chat)
					.set({ updatedAt: new Date() })
					.where(and(eq(chat.userId, userId), eq(chat.id, chatId)));
			});
		},

		async deleteMessages(userId, chatId, ids) {
			if (ids.length === 0) return;
			await db
				.delete(chatMessage)
				.where(
					and(
						eq(chatMessage.userId, userId),
						eq(chatMessage.chatId, chatId),
						inArray(chatMessage.id, ids)
					)
				);
		},

		async insertQuestions(userId, topicId, questions) {
			const rows = await db
				.insert(question)
				.values(
					questions.map((item) => ({
						userId,
						topicId,
						text: item.text,
						choices: item.choices,
						correctChoice: item.correctChoice,
						explanation: item.explanation,
						source: 'ai' as const,
						aiProvider: item.aiProvider,
						aiModel: item.aiModel,
						chatMessageId: item.chatMessageId,
					}))
				)
				.returning({ id: question.id });
			return rows.map((row) => row.id);
		},
	};
}

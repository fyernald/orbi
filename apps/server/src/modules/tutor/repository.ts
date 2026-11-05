import type {
	AiProvider,
	CourseGoal,
	EducationLevel,
	ExplanationStyle,
	GeneratedQuestion,
	MessageAttachment,
	TutorAction,
} from '@orbi/shared';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
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

export type NotesScope = { topicId: string } | { courseId: string };

export type NoteForTutor = {
	id: string;
	title: string;
	// set for notes of the whole course, so the model knows where each comes from
	topicName?: string;
	// the PDF the note was taken from, if any
	fileName: string | null;
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
	notesTotal: number | null;
	notesCut: boolean | null;
	thinkingMs: number[] | null;
	followUps: string[] | null;
	attachments: MessageAttachment[] | null;
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
	// the student's IANA time zone from the profile, null before onboarding
	findTimeZone(userId: string): Promise<string | null>;
	// The notes a reply can read, in a topic or (for the whole-course chat) a course:
	// the attached ones, then the newest others, until about maxLength characters.
	// total counts every note there, read or not.
	listNotesForReply(
		userId: string,
		scope: NotesScope,
		page: { maxLength: number; attachedIds: string[] }
	): Promise<{ notes: NoteForTutor[]; total: number }>;
	// the ids among these that are notes of the user in this course
	ownNoteIds(
		userId: string,
		courseId: string,
		ids: string[]
	): Promise<string[]>;
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
	messageExists(
		userId: string,
		chatId: string,
		messageId: string
	): Promise<boolean>;
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
	saveFollowUps(
		userId: string,
		chatId: string,
		messageId: string,
		questions: string[]
	): Promise<void>;
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
	notesTotal: chatMessage.notesTotal,
	notesCut: chatMessage.notesCut,
	thinkingMs: chatMessage.thinkingMs,
	followUps: chatMessage.followUps,
	attachments: chatMessage.attachments,
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

		async findTimeZone(userId) {
			const [found] = await db
				.select({ timezone: profile.timezone })
				.from(profile)
				.where(eq(profile.userId, userId));
			return found?.timezone ?? null;
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

		// Two runs of notes, each with its running length: the attached ones in the order
		// given, and the others newest first. A note that starts after maxLength is
		// dropped, and one that only fits in part is cut, so a long chat history of PDFs
		// is never read whole. Attached notes are kept as titles even when they do not
		// fit, so the tutor can say which ones it could not read.
		async listNotesForReply(userId, scope, { maxLength, attachedIds }) {
			const attached =
				attachedIds.length > 0 ? inArray(note.id, attachedIds) : sql`false`;
			const attachedOrder =
				attachedIds.length > 0
					? sql`array_position(array[${sql.join(
							attachedIds.map((id) => sql`${id}`),
							sql`, `
						)}]::uuid[], ${note.id})`
					: sql`0`;
			const ranked = db
				.select({
					id: note.id,
					title: note.title,
					topicName: topic.name,
					fileName: note.sourceName,
					content: note.content,
					createdAt: note.createdAt,
					attached: sql<boolean>`${attached}`.as('attached'),
					lengthBefore: sql<number>`coalesce(sum(length(${note.content})) over (
						partition by ${attached}
						order by ${attachedOrder}, ${note.createdAt} desc, ${note.id} desc
						rows between unbounded preceding and 1 preceding
					), 0)`.as('length_before'),
					total: sql<number>`count(*) over ()`.as('total'),
				})
				.from(note)
				.innerJoin(
					topic,
					and(eq(topic.userId, note.userId), eq(topic.id, note.topicId))
				)
				.where(
					and(
						eq(note.userId, userId),
						'topicId' in scope
							? eq(note.topicId, scope.topicId)
							: eq(topic.courseId, scope.courseId)
					)
				)
				.as('ranked');
			const rows = await db
				.select({
					id: ranked.id,
					title: ranked.title,
					topicName: ranked.topicName,
					fileName: ranked.fileName,
					content: sql<string>`left(${ranked.content}, greatest(${maxLength} - ${ranked.lengthBefore}, 0)::int)`,
					createdAt: ranked.createdAt,
					total: ranked.total,
				})
				.from(ranked)
				.where(sql`${ranked.attached} or ${ranked.lengthBefore} < ${maxLength}`)
				.orderBy(desc(ranked.createdAt), desc(ranked.id));
			const total = Number(rows[0]?.total ?? 0);
			return {
				// the topic's name only helps in the whole-course chat
				notes: rows.map(({ total: _, topicName, ...item }) =>
					'topicId' in scope ? item : { ...item, topicName }
				),
				total,
			};
		},

		async ownNoteIds(userId, courseId, ids) {
			if (ids.length === 0) return [];
			const rows = await db
				.select({ id: note.id })
				.from(note)
				.innerJoin(topic, eq(topic.id, note.topicId))
				.where(
					and(
						eq(note.userId, userId),
						eq(topic.courseId, courseId),
						inArray(note.id, ids)
					)
				);
			return rows.map(({ id }) => id);
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

		async messageExists(userId, chatId, messageId) {
			const [found] = await db
				.select({ id: chatMessage.id })
				.from(chatMessage)
				.where(
					and(
						eq(chatMessage.userId, userId),
						eq(chatMessage.chatId, chatId),
						eq(chatMessage.id, messageId)
					)
				);
			return found !== undefined;
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
						set: {
							parts: message.parts,
							thinkingMs: message.thinkingMs,
							updatedAt: new Date(),
						},
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

		async saveFollowUps(userId, chatId, messageId, questions) {
			await db
				.update(chatMessage)
				.set({ followUps: questions })
				.where(
					and(
						eq(chatMessage.userId, userId),
						eq(chatMessage.chatId, chatId),
						eq(chatMessage.id, messageId)
					)
				);
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
					questions.map((item, position) => ({
						userId,
						position,
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

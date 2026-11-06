import type {
	ChatAnswer,
	CourseColor,
	Question,
	QuestionSet,
	QuestionStatus,
	ReportQuestionInput,
	StudyQuestion,
} from '@orbi/shared';
import type { ReviewState } from '@orbi/core';
import {
	and,
	asc,
	count,
	desc,
	eq,
	inArray,
	isNotNull,
	min,
	ne,
} from 'drizzle-orm';
import type { Db } from '../../db';
import {
	answer,
	course,
	question,
	questionReport,
	reviewItem,
	topic,
} from '../../db/schema';

// a question waiting for review, with the topic and course it belongs to
export type PendingQuestion = {
	question: Question;
	courseId: string;
	courseName: string;
	courseColor: CourseColor;
	topicName: string;
};

export interface QuestionRepository {
	topicExists(
		userId: string,
		courseId: string,
		topicId: string
	): Promise<boolean>;
	courseExists(userId: string, courseId: string): Promise<boolean>;
	// the sets the tutor made in the course, newest first
	listSets(userId: string, courseId: string): Promise<QuestionSet[]>;
	listPending(userId: string): Promise<PendingQuestion[]>;
	// undefined when the user has no such question
	setStatus(
		userId: string,
		questionId: string,
		status: QuestionStatus
	): Promise<Question | undefined>;
	approvePending(userId: string, topicId: string): Promise<number>;
	// what an answer is checked against; undefined when the user has no such question
	findAnswerKey(
		userId: string,
		questionId: string
	): Promise<AnswerKey | undefined>;
	// undefined when the question was already answered in the chat; the review
	// schedule changes only when the answer is saved
	insertChatAnswer(
		userId: string,
		saved: ChatAnswer,
		reschedule: Reschedule
	): Promise<ChatAnswer | undefined>;
	listChatAnswers(userId: string, questionIds: string[]): Promise<ChatAnswer[]>;
	// undefined when the user has no such topic in that course
	findTopicNames(
		userId: string,
		courseId: string,
		topicId: string
	): Promise<{ courseName: string; topicName: string } | undefined>;
	listApproved(userId: string, topicId: string): Promise<StudyQuestion[]>;
	countPending(userId: string, topicId: string): Promise<number>;
	// a session saves every try, so a question can be answered again in a later one
	insertSessionAnswer(
		userId: string,
		saved: ChatAnswer,
		reschedule: Reschedule
	): Promise<void>;
	// the topic's questions the student kept or still has to review
	listForTopic(userId: string, topicId: string): Promise<Question[]>;
	insertManual(
		userId: string,
		topicId: string,
		content: QuestionContent
	): Promise<Question>;
	// undefined when the user has no such question in that topic
	updateContent(
		userId: string,
		topicId: string,
		questionId: string,
		content: QuestionContent
	): Promise<Question | undefined>;
	// false when the user has no such question in that topic
	deleteQuestion(
		userId: string,
		topicId: string,
		questionId: string
	): Promise<boolean>;
	// saves the report and takes the question out (rejected); undefined when the user
	// has no such question
	reportQuestion(
		userId: string,
		questionId: string,
		report: ReportQuestionInput
	): Promise<Question | 'already_reported' | undefined>;
}

// what the student writes; the status and who made it are set by the server
export type QuestionContent = {
	text: string;
	choices: string[];
	correctChoice: number;
	explanation: string | null;
};

// where the question stands after the answer, from where it stood before;
// previous is undefined for a question that was never answered
export type Reschedule = (previous: ReviewState | undefined) => ReviewState;

export type AnswerKey = {
	choiceCount: number;
	correctChoice: number;
	explanation: string | null;
	status: QuestionStatus;
};

const chatAnswerColumns = {
	questionId: answer.questionId,
	choice: answer.choice,
	correct: answer.correct,
};

const questionColumns = {
	id: question.id,
	topicId: question.topicId,
	type: question.type,
	text: question.text,
	choices: question.choices,
	correctChoice: question.correctChoice,
	explanation: question.explanation,
	status: question.status,
	setId: question.chatMessageId,
	createdAt: question.createdAt,
};

const reviewColumns = {
	repetitions: reviewItem.repetitions,
	intervalDays: reviewItem.intervalDays,
	ease: reviewItem.ease,
	dueAt: reviewItem.dueAt,
};

type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

// the row is locked, so two answers at once each build on the other's result
async function saveReview(
	tx: Tx,
	userId: string,
	questionId: string,
	reschedule: Reschedule
) {
	const [previous] = await tx
		.select(reviewColumns)
		.from(reviewItem)
		.where(
			and(eq(reviewItem.userId, userId), eq(reviewItem.questionId, questionId))
		)
		.for('update');
	const next = reschedule(previous);
	if (next === previous) return;
	await tx
		.insert(reviewItem)
		.values({ userId, questionId, ...next })
		.onConflictDoUpdate({
			target: [reviewItem.userId, reviewItem.questionId],
			set: next,
		});
}

type QuestionRow = Omit<Question, 'createdAt'> & { createdAt: Date };

const toApi = ({ createdAt, ...saved }: QuestionRow): Question => ({
	...saved,
	createdAt: createdAt.toISOString(),
});

const ownQuestion = (userId: string, topicId: string, questionId: string) =>
	and(
		eq(question.userId, userId),
		eq(question.topicId, topicId),
		eq(question.id, questionId)
	);

export function createQuestionRepository(db: Db): QuestionRepository {
	return {
		async topicExists(userId, courseId, topicId) {
			const [found] = await db
				.select({ id: topic.id })
				.from(topic)
				.where(
					and(
						eq(topic.userId, userId),
						eq(topic.courseId, courseId),
						eq(topic.id, topicId)
					)
				);
			return found !== undefined;
		},

		async courseExists(userId, courseId) {
			const [found] = await db
				.select({ id: course.id })
				.from(course)
				.where(and(eq(course.userId, userId), eq(course.id, courseId)));
			return found !== undefined;
		},

		// a set whose questions were all rejected or deleted is gone
		async listSets(userId, courseId) {
			const createdAt = min(question.createdAt);
			const rows = await db
				.select({
					id: question.chatMessageId,
					topicId: topic.id,
					topicName: topic.name,
					questionCount: count(),
					createdAt,
				})
				.from(question)
				.innerJoin(
					topic,
					and(eq(topic.userId, question.userId), eq(topic.id, question.topicId))
				)
				.where(
					and(
						eq(question.userId, userId),
						eq(topic.courseId, courseId),
						isNotNull(question.chatMessageId),
						ne(question.status, 'rejected')
					)
				)
				.groupBy(question.chatMessageId, topic.id, topic.name)
				.orderBy(desc(createdAt));
			return rows.map(({ id, createdAt, ...set }) => ({
				...set,
				id: id!,
				createdAt: createdAt!.toISOString(),
			}));
		},

		// the oldest set first, each in the order the AI wrote it
		async listPending(userId) {
			const rows = await db
				.select({
					...questionColumns,
					courseId: course.id,
					courseName: course.name,
					courseColor: course.color,
					topicName: topic.name,
				})
				.from(question)
				.innerJoin(
					topic,
					and(eq(topic.userId, question.userId), eq(topic.id, question.topicId))
				)
				.innerJoin(
					course,
					and(eq(course.userId, topic.userId), eq(course.id, topic.courseId))
				)
				.where(and(eq(question.userId, userId), eq(question.status, 'pending')))
				.orderBy(asc(question.createdAt), asc(question.position));
			return rows.map(
				({ courseId, courseName, courseColor, topicName, ...saved }) => ({
					question: toApi(saved),
					courseId,
					courseName,
					courseColor,
					topicName,
				})
			);
		},

		async setStatus(userId, questionId, status) {
			const [updated] = await db
				.update(question)
				.set({ status })
				.where(and(eq(question.userId, userId), eq(question.id, questionId)))
				.returning(questionColumns);
			return updated && toApi(updated);
		},

		async approvePending(userId, topicId) {
			const approved = await db
				.update(question)
				.set({ status: 'approved' })
				.where(
					and(
						eq(question.userId, userId),
						eq(question.topicId, topicId),
						eq(question.status, 'pending')
					)
				)
				.returning({ id: question.id });
			return approved.length;
		},

		async findAnswerKey(userId, questionId) {
			const [found] = await db
				.select({
					choices: question.choices,
					correctChoice: question.correctChoice,
					explanation: question.explanation,
					status: question.status,
				})
				.from(question)
				.where(and(eq(question.userId, userId), eq(question.id, questionId)));
			if (!found) return undefined;
			const { choices, ...key } = found;
			return { choiceCount: choices.length, ...key };
		},

		// two clicks at once both get here; the unique index lets only one in
		async insertChatAnswer(userId, saved, reschedule) {
			return db.transaction(async (tx) => {
				const [created] = await tx
					.insert(answer)
					.values({ userId, context: 'chat', ...saved })
					.onConflictDoNothing()
					.returning(chatAnswerColumns);
				if (created) {
					await saveReview(tx, userId, saved.questionId, reschedule);
				}
				return created;
			});
		},

		async listChatAnswers(userId, questionIds) {
			return db
				.select(chatAnswerColumns)
				.from(answer)
				.where(
					and(
						eq(answer.userId, userId),
						eq(answer.context, 'chat'),
						inArray(answer.questionId, questionIds)
					)
				);
		},

		async findTopicNames(userId, courseId, topicId) {
			const [found] = await db
				.select({ courseName: course.name, topicName: topic.name })
				.from(topic)
				.innerJoin(
					course,
					and(eq(course.userId, topic.userId), eq(course.id, topic.courseId))
				)
				.where(
					and(
						eq(topic.userId, userId),
						eq(topic.courseId, courseId),
						eq(topic.id, topicId)
					)
				);
			return found;
		},

		// the oldest set first, each in the order the AI wrote it
		async listApproved(userId, topicId) {
			return db
				.select({
					id: question.id,
					text: question.text,
					choices: question.choices,
				})
				.from(question)
				.where(
					and(
						eq(question.userId, userId),
						eq(question.topicId, topicId),
						eq(question.status, 'approved')
					)
				)
				.orderBy(asc(question.createdAt), asc(question.position));
		},

		async countPending(userId, topicId) {
			const [found] = await db
				.select({ pending: count() })
				.from(question)
				.where(
					and(
						eq(question.userId, userId),
						eq(question.topicId, topicId),
						eq(question.status, 'pending')
					)
				);
			return found?.pending ?? 0;
		},

		async insertSessionAnswer(userId, saved, reschedule) {
			await db.transaction(async (tx) => {
				await tx
					.insert(answer)
					.values({ userId, context: 'session', ...saved });
				await saveReview(tx, userId, saved.questionId, reschedule);
			});
		},

		// the newest set first, each in the order it was made
		async listForTopic(userId, topicId) {
			const rows = await db
				.select(questionColumns)
				.from(question)
				.where(
					and(
						eq(question.userId, userId),
						eq(question.topicId, topicId),
						ne(question.status, 'rejected')
					)
				)
				.orderBy(desc(question.createdAt), asc(question.position));
			return rows.map(toApi);
		},

		// the student wrote it, so it needs no review
		async insertManual(userId, topicId, content) {
			const [created] = await db
				.insert(question)
				.values({
					userId,
					topicId,
					...content,
					status: 'approved',
					source: 'manual',
				})
				.returning(questionColumns);
			return toApi(created!);
		},

		async updateContent(userId, topicId, questionId, content) {
			const [updated] = await db
				.update(question)
				.set(content)
				.where(ownQuestion(userId, topicId, questionId))
				.returning(questionColumns);
			return updated && toApi(updated);
		},

		// its answers go with it (ON DELETE CASCADE)
		async deleteQuestion(userId, topicId, questionId) {
			const deleted = await db
				.delete(question)
				.where(ownQuestion(userId, topicId, questionId))
				.returning({ id: question.id });
			return deleted.length > 0;
		},

		// two reports at once both get here; the unique index lets only one in
		async reportQuestion(userId, questionId, { reason, comment }) {
			const own = and(eq(question.userId, userId), eq(question.id, questionId));
			return db.transaction(async (tx) => {
				const [made] = await tx
					.select({
						aiProvider: question.aiProvider,
						aiModel: question.aiModel,
					})
					.from(question)
					.where(own);
				if (!made) return undefined;
				const [saved] = await tx
					.insert(questionReport)
					.values({
						userId,
						questionId,
						reason,
						comment: comment || null,
						...made,
					})
					.onConflictDoNothing()
					.returning({ id: questionReport.id });
				if (!saved) return 'already_reported';
				const [rejected] = await tx
					.update(question)
					.set({ status: 'rejected' })
					.where(own)
					.returning(questionColumns);
				return toApi(rejected!);
			});
		},
	};
}

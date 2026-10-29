import type {
	Course,
	CreateCourseInput,
	CreateTopicInput,
	Topic,
} from '@orbi/shared';
import { and, asc, count, countDistinct, eq, sql } from 'drizzle-orm';
import type { Db } from '../../db';
import { course, note, topic } from '../../db/schema';

export interface CourseRepository {
	listCourses(userId: string): Promise<Course[]>;
	findCourse(userId: string, courseId: string): Promise<Course | undefined>;
	insertCourse(userId: string, input: CreateCourseInput): Promise<Course>;
	listTopics(userId: string, courseId: string): Promise<Topic[]>;
	insertTopic(
		userId: string,
		courseId: string,
		input: CreateTopicInput
	): Promise<Topic>;
	// each returns false when nothing of this user matched
	deleteCourse(userId: string, courseId: string): Promise<boolean>;
	deleteTopic(
		userId: string,
		courseId: string,
		topicId: string
	): Promise<boolean>;
}

const courseColumns = {
	id: course.id,
	name: course.name,
	description: course.description,
	color: course.color,
	goal: course.goal,
	examDate: course.examDate,
};

const toIso = (value: Date | string) => new Date(value).toISOString();

// needs course LEFT JOIN topic LEFT JOIN note, grouped by course
const courseSummary = {
	...courseColumns,
	topicCount: countDistinct(topic.id),
	noteCount: count(note.id),
	// greatest() skips the nulls of a course without topics or notes
	lastActivityAt:
		sql<string>`greatest(${course.updatedAt}, max(${topic.updatedAt}), max(${note.updatedAt}))`.mapWith(
			toIso
		),
};

const topicColumns = {
	id: topic.id,
	courseId: topic.courseId,
	name: topic.name,
	position: topic.position,
};

const topicWithNoteCount = { ...topicColumns, noteCount: count(note.id) };

export function createCourseRepository(db: Db): CourseRepository {
	return {
		listCourses: (userId) =>
			db
				.select(courseSummary)
				.from(course)
				.leftJoin(topic, eq(topic.courseId, course.id))
				.leftJoin(note, eq(note.topicId, topic.id))
				.where(eq(course.userId, userId))
				.groupBy(course.id)
				.orderBy(asc(course.createdAt), asc(course.id)),

		async findCourse(userId, courseId) {
			const [found] = await db
				.select(courseSummary)
				.from(course)
				.leftJoin(topic, eq(topic.courseId, course.id))
				.leftJoin(note, eq(note.topicId, topic.id))
				.where(and(eq(course.userId, userId), eq(course.id, courseId)))
				.groupBy(course.id);
			return found;
		},

		// the course and its first topics are saved together, or not at all
		insertCourse: (userId, { topics, description, ...input }) =>
			db.transaction(async (tx) => {
				const [created] = await tx
					.insert(course)
					.values({ userId, ...input, description: description || null })
					.returning({ ...courseColumns, updatedAt: course.updatedAt });
				if (topics.length > 0) {
					await tx.insert(topic).values(
						topics.map((name, position) => ({
							userId,
							courseId: created!.id,
							name,
							position,
						}))
					);
				}
				const { updatedAt, ...saved } = created!;
				return {
					...saved,
					topicCount: topics.length,
					noteCount: 0,
					lastActivityAt: updatedAt.toISOString(),
				};
			}),

		listTopics: (userId, courseId) =>
			db
				.select(topicWithNoteCount)
				.from(topic)
				.leftJoin(note, eq(note.topicId, topic.id))
				.where(and(eq(topic.userId, userId), eq(topic.courseId, courseId)))
				.groupBy(topic.id)
				.orderBy(asc(topic.position), asc(topic.createdAt)),

		async insertTopic(userId, courseId, input) {
			const [created] = await db
				.insert(topic)
				.values({
					userId,
					courseId,
					...input,
					// a new topic goes to the end of the course
					position: sql`(select coalesce(max(${topic.position}), -1) + 1 from ${topic} where ${topic.courseId} = ${courseId})`,
				})
				.returning(topicColumns);
			return { ...created!, noteCount: 0 };
		},

		// topics and notes go with it (ON DELETE CASCADE)
		async deleteCourse(userId, courseId) {
			const deleted = await db
				.delete(course)
				.where(and(eq(course.userId, userId), eq(course.id, courseId)))
				.returning({ id: course.id });
			return deleted.length > 0;
		},

		async deleteTopic(userId, courseId, topicId) {
			const deleted = await db
				.delete(topic)
				.where(
					and(
						eq(topic.userId, userId),
						eq(topic.courseId, courseId),
						eq(topic.id, topicId)
					)
				)
				.returning({ id: topic.id });
			return deleted.length > 0;
		},
	};
}

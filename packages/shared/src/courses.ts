import { z } from 'zod';

export const NAME_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;
// the first topics, added with the course; more can be added on the course page
export const FIRST_TOPICS_MAX = 30;

export const COURSE_COLORS = ['blue', 'teal', 'green', 'amber', 'red'] as const;
export const COURSE_GOALS = ['exam_prep', 'keep_up', 'self_study'] as const;

const name = (thing: string) =>
	z
		.string()
		.trim()
		.min(1, `Enter a ${thing} name.`)
		.max(NAME_MAX_LENGTH, `Use at most ${NAME_MAX_LENGTH} characters.`);

export const topicName = name('topic');

export const createCourseInput = z.object({
	name: name('course'),
	description: z
		.string()
		.trim()
		.max(
			DESCRIPTION_MAX_LENGTH,
			`Use at most ${DESCRIPTION_MAX_LENGTH} characters.`
		)
		.optional(),
	color: z.enum(COURSE_COLORS, 'Choose a colour.'),
	goal: z.enum(COURSE_GOALS, 'Choose what this course is for.'),
	examDate: z.iso.date('Enter a valid date.').nullable().optional(),
	topics: z
		.array(topicName)
		.max(
			FIRST_TOPICS_MAX,
			`Add at most ${FIRST_TOPICS_MAX} topics here. You can add more later.`
		),
});

export const createTopicInput = z.object({ name: topicName });

export const courseParams = z.object({ courseId: z.uuid('Course not found.') });

export const topicParams = courseParams.extend({
	topicId: z.uuid('Topic not found.'),
});

// what the API sends back; user ids and timestamps stay on the server
export const course = z.object({
	id: z.uuid(),
	name: z.string(),
	description: z.string().nullable(),
	color: z.enum(COURSE_COLORS),
	goal: z.enum(COURSE_GOALS),
	examDate: z.iso.date().nullable(),
	topicCount: z.int(),
	noteCount: z.int(),
	// the latest change to the course, its topics, or their notes
	lastActivityAt: z.iso.datetime(),
});

export const topic = z.object({
	id: z.uuid(),
	courseId: z.uuid(),
	name: z.string(),
	position: z.int(),
	noteCount: z.int(),
});

export type CourseColor = (typeof COURSE_COLORS)[number];
export type CourseGoal = (typeof COURSE_GOALS)[number];
export type CreateCourseInput = z.infer<typeof createCourseInput>;
export type CreateTopicInput = z.infer<typeof createTopicInput>;
export type Course = z.infer<typeof course>;
export type Topic = z.infer<typeof topic>;

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

const examDate = z.iso.date('Enter a valid date.').nullable();

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
	examDate: examDate.optional(),
	topics: z
		.array(topicName)
		.max(
			FIRST_TOPICS_MAX,
			`Add at most ${FIRST_TOPICS_MAX} topics here. You can add more later.`
		),
});

export const createTopicInput = z.object({ name: topicName });

export const renameCourseInput = z.object({ name: name('course') });
export const examDateInput = z.object({ examDate });

// a rename, a new exam date, or both
export const updateCourseInput = z
	.object({ name: name('course'), examDate })
	.partial()
	.refine(
		(input) => input.name !== undefined || input.examDate !== undefined,
		'Nothing to change.'
	);

// a rename, or the day the topic was ticked off in the study plan (null to untick)
export const updateTopicInput = z
	.object({ name: topicName, planDoneOn: z.iso.date().nullable() })
	.partial()
	.refine(
		(input) => input.name !== undefined || input.planDoneOn !== undefined,
		'Nothing to change.'
	);

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
	// the student's day it was ticked off in the study plan
	planDoneOn: z.iso.date().nullable(),
});

// a topic with the name of its course, for places that list the topics of every
// course at once, like the message box on Home
export const courseTopic = z.object({
	id: z.uuid(),
	courseId: z.uuid(),
	courseName: z.string(),
	name: z.string(),
});

export type CourseColor = (typeof COURSE_COLORS)[number];
export type CourseGoal = (typeof COURSE_GOALS)[number];
export type CreateCourseInput = z.infer<typeof createCourseInput>;
export type CreateTopicInput = z.infer<typeof createTopicInput>;
export type ExamDateInput = z.infer<typeof examDateInput>;
export type UpdateCourseInput = z.infer<typeof updateCourseInput>;
export type UpdateTopicInput = z.infer<typeof updateTopicInput>;
export type Course = z.infer<typeof course>;
export type Topic = z.infer<typeof topic>;
export type CourseTopic = z.infer<typeof courseTopic>;

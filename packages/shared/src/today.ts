import { z } from 'zod';
import { COURSE_COLORS } from './courses';

// up to this many questions the student never answered join the list each day,
// so approving a big set does not fill one day
export const NEW_QUESTIONS_PER_DAY = 10;

// a topic under 70 is offered for practice once nothing is due
export const WEAK_MASTERY = 70;

const topicOfCourse = z.object({
	courseId: z.uuid(),
	courseName: z.string(),
	courseColor: z.enum(COURSE_COLORS),
	topicId: z.uuid(),
	topicName: z.string(),
});

// a topic with questions to answer today: due again, or new
export const todayTopic = topicOfCourse.extend({
	dueCount: z.int(),
	newCount: z.int(),
	// null before the topic's first answer
	mastery: z.int().nullable(),
});

export const todayPlan = z.object({
	// today in the student's time zone, like "2026-11-06"
	date: z.iso.date(),
	// the weakest topic first
	topics: z.array(todayTopic),
	// the next days with something due, from tomorrow, in the student's time zone
	upcoming: z.array(z.object({ date: z.iso.date(), count: z.int() })),
	answeredToday: z.int(),
	correctToday: z.int(),
	// different questions answered today, for "6 of 18 done"
	questionsDoneToday: z.int(),
	// what to do once the list is empty: the weakest topics, and topics with no
	// questions yet
	weakTopics: z.array(topicOfCourse.extend({ mastery: z.int() })),
	emptyTopics: z.array(topicOfCourse),
});

// ?today=1 limits a topic's study session to the questions in today's list
export const studySessionQuery = z.object({
	today: z
		.enum(['1'])
		.optional()
		.transform((value) => value === '1'),
});

export type TodayTopic = z.infer<typeof todayTopic>;
export type TodayPlan = z.infer<typeof todayPlan>;

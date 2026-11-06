import { randomUUID } from 'node:crypto';
import { localDate } from '@orbi/core';
import { NEW_QUESTIONS_PER_DAY, type TodayPlan } from '@orbi/shared';
import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { reviewItem } from '../../db/schema';
import { createTestDb } from '../../db/testing';
import { createMemoryMailer } from '../../mail/testing';
import { createTestApp, signUpTestUser } from '../../testing';
import { createTutorRepository } from '../tutor/repository';

let app: Awaited<ReturnType<typeof createTestApp>>;
let db: Awaited<ReturnType<typeof createTestDb>>;
let tutor: ReturnType<typeof createTutorRepository>;

beforeAll(async () => {
	db = await createTestDb();
	tutor = createTutorRepository(db);
	app = await createTestApp(createMemoryMailer(), {
		requireEmailVerification: false,
		db,
	});
});

afterAll(async () => {
	await app.close();
});

// every test gets its own student, since today's list spans all their courses
let students = 0;
const newStudent = () => {
	students += 1;
	return signUpTestUser(app, `today-${students}@test.dev`);
};

const send = (
	cookie: string,
	method: 'GET' | 'POST' | 'PATCH',
	url: string,
	payload?: object
) => app.inject({ method, url, headers: { cookie }, payload });

const todayOf = async (cookie: string): Promise<TodayPlan> =>
	(await send(cookie, 'GET', '/api/today')).json();

async function createCourse(cookie: string, name: string, topics: string[]) {
	const course = (
		await send(cookie, 'POST', '/api/courses', {
			name,
			color: 'teal',
			goal: 'exam_prep',
			topics,
		})
	).json();
	const saved: { id: string }[] = (
		await send(cookie, 'GET', `/api/courses/${course.id}/topics`)
	).json();
	return { courseId: course.id as string, topicIds: saved.map(({ id }) => id) };
}

// approved questions with choice 1 as the right answer
async function addApproved(cookie: string, topicId: string, count: number) {
	const userId = (await send(cookie, 'GET', '/api/auth/get-session')).json()
		.user.id as string;
	const ids = await tutor.insertQuestions(
		userId,
		topicId,
		Array.from({ length: count }, (_, i) => ({
			text: `Q${i + 1}`,
			choices: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
			correctChoice: 1,
			explanation: null,
			aiProvider: 'google',
			aiModel: 'gemini-test',
			chatMessageId: randomUUID(),
		}))
	);
	for (const id of ids) {
		await send(cookie, 'PATCH', `/api/questions/${id}`, { status: 'approved' });
	}
	return ids;
}

const answer = (cookie: string, id: string, choice: number) =>
	send(cookie, 'POST', `/api/questions/${id}/session-answer`, { choice });

// as if the question came due yesterday
const makeDue = (questionId: string) =>
	db
		.update(reviewItem)
		.set({ dueAt: sql`now() - interval '1 day'` })
		.where(eq(reviewItem.questionId, questionId));

const tomorrow = () =>
	localDate(new Date(Date.now() + 24 * 60 * 60 * 1000), 'UTC');

describe("today's study list", () => {
	it('is empty for a student with nothing to study', async () => {
		const ada = await newStudent();

		expect(await todayOf(ada)).toEqual({
			date: localDate(new Date(), 'UTC'),
			topics: [],
			upcoming: [],
			answeredToday: 0,
			correctToday: 0,
			weakTopics: [],
			emptyTopics: [],
		});
	});

	it('lists new approved questions, up to the daily limit', async () => {
		const ada = await newStudent();
		const { courseId, topicIds } = await createCourse(ada, 'Biology', [
			'Cells',
		]);
		await addApproved(ada, topicIds[0]!, NEW_QUESTIONS_PER_DAY + 2);

		expect((await todayOf(ada)).topics).toEqual([
			{
				courseId,
				courseName: 'Biology',
				courseColor: 'teal',
				topicId: topicIds[0],
				topicName: 'Cells',
				dueCount: 0,
				newCount: NEW_QUESTIONS_PER_DAY,
				mastery: null,
			},
		]);
	});

	it('gets shorter as the student answers', async () => {
		const ada = await newStudent();
		const { topicIds } = await createCourse(ada, 'Biology', ['Cells']);
		const ids = await addApproved(ada, topicIds[0]!, 3);

		await answer(ada, ids[0]!, 1);
		await answer(ada, ids[1]!, 0);

		const plan = await todayOf(ada);
		expect(plan.topics).toMatchObject([{ dueCount: 0, newCount: 1 }]);
		expect(plan).toMatchObject({
			answeredToday: 2,
			correctToday: 1,
			upcoming: [{ date: tomorrow(), count: 2 }],
		});
	});

	it('does not give new questions past the limit after some are answered', async () => {
		const ada = await newStudent();
		const { topicIds } = await createCourse(ada, 'Biology', ['Cells']);
		const ids = await addApproved(ada, topicIds[0]!, NEW_QUESTIONS_PER_DAY + 5);

		for (const id of ids.slice(0, 4)) await answer(ada, id, 1);

		expect((await todayOf(ada)).topics).toMatchObject([
			{ newCount: NEW_QUESTIONS_PER_DAY - 4 },
		]);
	});

	it('lists due questions, the weakest topic first', async () => {
		const ada = await newStudent();
		const { topicIds } = await createCourse(ada, 'Biology', ['Cells', 'Genes']);
		const [cells, genes] = topicIds as [string, string];
		const [knownCell] = await addApproved(ada, cells, 1);
		const [missedGene] = await addApproved(ada, genes, 1);
		await answer(ada, knownCell!, 1);
		await answer(ada, missedGene!, 0);
		await makeDue(knownCell!);
		await makeDue(missedGene!);

		expect((await todayOf(ada)).topics).toMatchObject([
			{ topicName: 'Genes', dueCount: 1, newCount: 0, mastery: 0 },
			{ topicName: 'Cells', dueCount: 1, newCount: 0, mastery: 50 },
		]);
	});

	it('leaves out questions that are not approved', async () => {
		const ada = await newStudent();
		const { topicIds } = await createCourse(ada, 'Biology', ['Cells']);
		const [id] = await addApproved(ada, topicIds[0]!, 1);
		await answer(ada, id!, 1);
		await makeDue(id!);

		await send(ada, 'PATCH', `/api/questions/${id}`, { status: 'rejected' });

		expect((await todayOf(ada)).topics).toEqual([]);
	});

	it('suggests weak topics and topics with no questions', async () => {
		const ada = await newStudent();
		const { topicIds } = await createCourse(ada, 'Biology', [
			'Cells',
			'Genes',
			'Organs',
		]);
		const [cells, genes, organs] = topicIds as [string, string, string];
		const [missed] = await addApproved(ada, cells, 1);
		const [known] = await addApproved(ada, genes, 1);
		for (let i = 0; i < 3; i += 1) await answer(ada, known!, 1);
		await answer(ada, missed!, 0);

		const plan = await todayOf(ada);

		expect(plan.weakTopics).toMatchObject([{ topicId: cells, mastery: 0 }]);
		expect(plan.emptyTopics).toMatchObject([{ topicId: organs }]);
	});

	it("starts a topic's session with only today's questions", async () => {
		const ada = await newStudent();
		const { courseId, topicIds } = await createCourse(ada, 'Biology', [
			'Cells',
		]);
		const [done, due, fresh] = (await addApproved(ada, topicIds[0]!, 3)) as [
			string,
			string,
			string,
		];
		await answer(ada, done, 1);
		await answer(ada, due, 1);
		await makeDue(due);
		const study = (query = '') =>
			send(
				ada,
				'GET',
				`/api/courses/${courseId}/topics/${topicIds[0]}/study${query}`
			);

		const today = (await study('?today=1')).json();
		const all = (await study()).json();

		expect(today.questions.map(({ id }: { id: string }) => id)).toEqual([
			due,
			fresh,
		]);
		expect(all.questions).toHaveLength(3);
	});
});

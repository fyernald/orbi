import { beforeAll, describe, expect, it } from 'vitest';
import { note, user } from '../../db/schema';
import { createTestDb } from '../../db/testing';
import { createCourseRepository, type CourseRepository } from './repository';

// notes belong to the notes module, so this test writes them straight into the database
let db: Awaited<ReturnType<typeof createTestDb>>;
let repo: CourseRepository;

beforeAll(async () => {
	db = await createTestDb();
	repo = createCourseRepository(db);
	await db
		.insert(user)
		.values({ id: 'ada', name: 'Ada', email: 'ada@test.dev' });
});

describe('course repository', () => {
	it('counts the notes of all topics of a course', async () => {
		const created = await repo.insertCourse('ada', {
			name: 'Biology',
			color: 'blue',
			goal: 'keep_up',
			topics: ['Cells', 'Genetics', 'Evolution'],
		});
		const [cells, genetics] = await repo.listTopics('ada', created.id);
		await db.insert(note).values([
			{
				userId: 'ada',
				topicId: cells!.id,
				title: 'Mitosis',
				content: 'Phases',
			},
			{ userId: 'ada', topicId: cells!.id, title: 'Meiosis', content: 'Pairs' },
			{ userId: 'ada', topicId: genetics!.id, title: 'DNA', content: 'Bases' },
		]);

		const course = await repo.findCourse('ada', created.id);
		const topics = await repo.listTopics('ada', created.id);

		expect(course).toMatchObject({ topicCount: 3, noteCount: 3 });
		expect(topics.map((topic) => topic.noteCount)).toEqual([2, 1, 0]);
	});
});

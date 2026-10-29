import type {
	Course,
	CreateCourseInput,
	CreateTopicInput,
	Topic,
} from '@orbi/shared';
import { NotFoundError } from '../../errors';
import type { CourseRepository } from './repository';

export interface CourseService {
	listCourses(userId: string): Promise<Course[]>;
	getCourse(userId: string, courseId: string): Promise<Course>;
	createCourse(userId: string, input: CreateCourseInput): Promise<Course>;
	listTopics(userId: string, courseId: string): Promise<Topic[]>;
	createTopic(
		userId: string,
		courseId: string,
		input: CreateTopicInput
	): Promise<Topic>;
	deleteCourse(userId: string, courseId: string): Promise<void>;
	deleteTopic(userId: string, courseId: string, topicId: string): Promise<void>;
}

export function createCourseService({
	repo,
}: {
	repo: CourseRepository;
}): CourseService {
	// another user's course answers the same as a missing one, so ids cannot be probed
	async function getCourse(userId: string, courseId: string) {
		const found = await repo.findCourse(userId, courseId);
		if (!found) throw new NotFoundError('Course not found.');
		return found;
	}

	return {
		listCourses: (userId) => repo.listCourses(userId),
		getCourse,
		createCourse: (userId, input) => repo.insertCourse(userId, input),

		async listTopics(userId, courseId) {
			await getCourse(userId, courseId);
			return repo.listTopics(userId, courseId);
		},

		// a topic needs a course the user owns
		async createTopic(userId, courseId, input) {
			await getCourse(userId, courseId);
			return repo.insertTopic(userId, courseId, input);
		},

		async deleteCourse(userId, courseId) {
			if (!(await repo.deleteCourse(userId, courseId))) {
				throw new NotFoundError('Course not found.');
			}
		},

		async deleteTopic(userId, courseId, topicId) {
			if (!(await repo.deleteTopic(userId, courseId, topicId))) {
				throw new NotFoundError('Topic not found.');
			}
		},
	};
}

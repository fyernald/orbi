import {
	course,
	courseParams,
	createCourseInput,
	createTopicInput,
	topic,
	topicParams,
} from '@orbi/shared';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { RequireUser } from '../auth/session';
import type { CourseService } from './service';

type CourseRoutesDeps = {
	courses: CourseService;
	requireUser: RequireUser;
};

export function createCourseRoutes({
	courses,
	requireUser,
}: CourseRoutesDeps): FastifyPluginAsyncZod {
	return async (api) => {
		api.get(
			'/courses',
			{ schema: { response: { 200: z.array(course) } } },
			async (request) => courses.listCourses(await requireUser(request))
		);

		api.post(
			'/courses',
			{ schema: { body: createCourseInput, response: { 201: course } } },
			async (request, reply) => {
				const userId = await requireUser(request);
				const created = await courses.createCourse(userId, request.body);
				return reply.status(201).send(created);
			}
		);

		api.get(
			'/courses/:courseId',
			{ schema: { params: courseParams, response: { 200: course } } },
			async (request) =>
				courses.getCourse(await requireUser(request), request.params.courseId)
		);

		api.get(
			'/courses/:courseId/topics',
			{ schema: { params: courseParams, response: { 200: z.array(topic) } } },
			async (request) =>
				courses.listTopics(await requireUser(request), request.params.courseId)
		);

		api.post(
			'/courses/:courseId/topics',
			{
				schema: {
					params: courseParams,
					body: createTopicInput,
					response: { 201: topic },
				},
			},
			async (request, reply) => {
				const userId = await requireUser(request);
				const created = await courses.createTopic(
					userId,
					request.params.courseId,
					request.body
				);
				return reply.status(201).send(created);
			}
		);

		api.delete(
			'/courses/:courseId',
			{ schema: { params: courseParams } },
			async (request, reply) => {
				const userId = await requireUser(request);
				await courses.deleteCourse(userId, request.params.courseId);
				return reply.status(204).send();
			}
		);

		api.delete(
			'/courses/:courseId/topics/:topicId',
			{ schema: { params: topicParams } },
			async (request, reply) => {
				const userId = await requireUser(request);
				const { courseId, topicId } = request.params;
				await courses.deleteTopic(userId, courseId, topicId);
				return reply.status(204).send();
			}
		);
	};
}

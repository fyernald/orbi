import {
	answerQuestionInput,
	approveTopicQuestionsOutput,
	chatAnswer,
	chatAnswersQuery,
	courseParams,
	question,
	questionInput,
	questionParams,
	questionSet,
	reportQuestionInput,
	reviewTopic,
	sessionAnswer,
	studySession,
	studySessionQuery,
	todayPlan,
	topicMastery,
	topicParams,
	topicQuestionParams,
	updateQuestionInput,
} from '@orbi/shared';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { routeLimit, type RateLimits } from '../../rate-limit';
import type { RequireUser } from '../auth/session';
import type { QuestionService } from './service';

type QuestionRoutesDeps = {
	questions: QuestionService;
	requireUser: RequireUser;
	limits: RateLimits;
};

export function createQuestionRoutes({
	questions,
	requireUser,
	limits,
}: QuestionRoutesDeps): FastifyPluginAsyncZod {
	return async (api) => {
		// every question that waits for the student's review, by topic
		api.get(
			'/questions/review',
			{ schema: { response: { 200: z.array(reviewTopic) } } },
			async (request) => {
				const userId = await requireUser(request);
				return questions.listForReview(userId);
			}
		);

		api.patch(
			'/questions/:questionId',
			{
				schema: {
					params: questionParams,
					body: updateQuestionInput,
					response: { 200: question },
				},
			},
			async (request) => {
				const userId = await requireUser(request);
				return questions.setStatus(
					userId,
					request.params.questionId,
					request.body.status
				);
			}
		);

		// approves every question of the topic that still waits for review
		api.post(
			'/courses/:courseId/topics/:topicId/questions/approve',
			{
				schema: {
					params: topicParams,
					response: { 200: approveTopicQuestionsOutput },
				},
			},
			async (request) => {
				const userId = await requireUser(request);
				const { courseId, topicId } = request.params;
				return questions.approveTopic(userId, courseId, topicId);
			}
		);

		// the answers the student already gave to these questions in the chat
		api.get(
			'/questions/chat-answers',
			{
				schema: {
					querystring: chatAnswersQuery,
					response: { 200: z.array(chatAnswer) },
				},
			},
			async (request) => {
				const userId = await requireUser(request);
				return questions.listChatAnswers(userId, request.query.ids);
			}
		);

		api.post(
			'/questions/:questionId/chat-answer',
			{
				schema: {
					params: questionParams,
					body: answerQuestionInput,
					response: { 201: chatAnswer },
				},
			},
			async (request, reply) => {
				const userId = await requireUser(request);
				const saved = await questions.answerInChat(
					userId,
					request.params.questionId,
					request.body.choice
				);
				return reply.status(201).send(saved);
			}
		);

		// the approved questions of a topic, to answer one by one
		api.get(
			'/courses/:courseId/topics/:topicId/study',
			{
				schema: {
					params: topicParams,
					querystring: studySessionQuery,
					response: { 200: studySession },
				},
			},
			async (request) => {
				const userId = await requireUser(request);
				const { courseId, topicId } = request.params;
				return questions.startSession(userId, courseId, topicId, {
					today: request.query.today,
				});
			}
		);

		// what to study today from every course, for Home
		api.get(
			'/today',
			{ schema: { response: { 200: todayPlan } } },
			async (request) => questions.today(await requireUser(request))
		);

		api.post(
			'/questions/:questionId/session-answer',
			{
				schema: {
					params: questionParams,
					body: answerQuestionInput,
					response: { 201: sessionAnswer },
				},
				config: routeLimit(limits.sessionAnswer),
			},
			async (request, reply) => {
				const userId = await requireUser(request);
				const saved = await questions.answerInSession(
					userId,
					request.params.questionId,
					request.body.choice
				);
				return reply.status(201).send(saved);
			}
		);

		// what the tutor made in the course, for its Study pane
		api.get(
			'/courses/:courseId/question-sets',
			{
				schema: {
					params: courseParams,
					response: { 200: z.array(questionSet) },
				},
			},
			async (request) => {
				const userId = await requireUser(request);
				return questions.listSets(userId, request.params.courseId);
			}
		);

		// how well the student knows each topic of the course
		api.get(
			'/courses/:courseId/mastery',
			{
				schema: {
					params: courseParams,
					response: { 200: z.array(topicMastery) },
				},
			},
			async (request) => {
				const userId = await requireUser(request);
				return questions.listMastery(userId, request.params.courseId);
			}
		);

		// the topic's questions, except the rejected ones
		api.get(
			'/courses/:courseId/topics/:topicId/questions',
			{ schema: { params: topicParams, response: { 200: z.array(question) } } },
			async (request) => {
				const userId = await requireUser(request);
				const { courseId, topicId } = request.params;
				return questions.listForTopic(userId, courseId, topicId);
			}
		);

		api.post(
			'/courses/:courseId/topics/:topicId/questions',
			{
				schema: {
					params: topicParams,
					body: questionInput,
					response: { 201: question },
				},
			},
			async (request, reply) => {
				const userId = await requireUser(request);
				const { courseId, topicId } = request.params;
				const created = await questions.addQuestion(
					userId,
					courseId,
					topicId,
					request.body
				);
				return reply.status(201).send(created);
			}
		);

		api.patch(
			'/courses/:courseId/topics/:topicId/questions/:questionId',
			{
				schema: {
					params: topicQuestionParams,
					body: questionInput,
					response: { 200: question },
				},
			},
			async (request) => {
				const userId = await requireUser(request);
				const { courseId, topicId, questionId } = request.params;
				return questions.updateQuestion(
					userId,
					courseId,
					topicId,
					questionId,
					request.body
				);
			}
		);

		api.delete(
			'/courses/:courseId/topics/:topicId/questions/:questionId',
			{ schema: { params: topicQuestionParams } },
			async (request, reply) => {
				const userId = await requireUser(request);
				const { courseId, topicId, questionId } = request.params;
				await questions.deleteQuestion(userId, courseId, topicId, questionId);
				return reply.status(204).send();
			}
		);

		// sends back the question, now rejected, so the review list can update
		api.post(
			'/questions/:questionId/report',
			{
				schema: {
					params: questionParams,
					body: reportQuestionInput,
					response: { 201: question },
				},
			},
			async (request, reply) => {
				const userId = await requireUser(request);
				const rejected = await questions.reportQuestion(
					userId,
					request.params.questionId,
					request.body
				);
				return reply.status(201).send(rejected);
			}
		);
	};
}

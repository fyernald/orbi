import {
	answerQuestionInput,
	approveTopicQuestionsOutput,
	chatAnswer,
	chatAnswersQuery,
	question,
	questionParams,
	reviewTopic,
	topicParams,
	updateQuestionInput,
} from '@orbi/shared';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { RequireUser } from '../auth/session';
import type { QuestionService } from './service';

type QuestionRoutesDeps = {
	questions: QuestionService;
	requireUser: RequireUser;
};

export function createQuestionRoutes({
	questions,
	requireUser,
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
	};
}

import {
	aiModels,
	chatMessagesPage,
	chatParams,
	chatSummary,
	chatThread,
	courseParams,
	earlierMessagesQuery,
	sendChatMessageInput,
} from '@orbi/shared';
import { createUIMessageStreamResponse } from 'ai';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { RequireUser } from '../auth/session';
import type { TutorService } from './service';

type TutorRoutesDeps = {
	tutor: TutorService;
	requireUser: RequireUser;
};

export function createTutorRoutes({
	tutor,
	requireUser,
}: TutorRoutesDeps): FastifyPluginAsyncZod {
	return async (api) => {
		api.get(
			'/models',
			{ schema: { response: { 200: aiModels } } },
			async (request) => {
				await requireUser(request);
				return tutor.listModels();
			}
		);

		api.get(
			'/courses/:courseId/chats',
			{
				schema: {
					params: courseParams,
					response: { 200: z.array(chatSummary) },
				},
			},
			async (request) =>
				tutor.listChats(await requireUser(request), request.params.courseId)
		);

		api.get(
			'/chats/:chatId',
			{ schema: { params: chatParams, response: { 200: chatThread } } },
			async (request) =>
				tutor.getChat(await requireUser(request), request.params.chatId)
		);

		api.get(
			'/chats/:chatId/messages',
			{
				schema: {
					params: chatParams,
					querystring: earlierMessagesQuery,
					response: { 200: chatMessagesPage },
				},
			},
			async (request) =>
				tutor.getEarlierMessages(
					await requireUser(request),
					request.params.chatId,
					request.query.before
				)
		);

		// streams the reply as Server-Sent Events in the AI SDK's UI message format
		api.post(
			'/chats/:chatId/messages',
			{ schema: { params: chatParams, body: sendChatMessageInput } },
			async (request, reply) => {
				const userId = await requireUser(request);
				// Stop in the browser, or a closed tab, ends the request: the model stops too
				const controller = new AbortController();
				reply.raw.on('close', () => {
					if (!reply.raw.writableFinished) controller.abort();
				});
				const stream = await tutor.reply(
					userId,
					request.params.chatId,
					request.body,
					controller.signal
				);
				return reply.send(
					createUIMessageStreamResponse({
						stream,
						// no-transform: a proxy that gzips (the Next.js dev rewrite does) holds
						// the whole reply back until it ends
						headers: { 'cache-control': 'no-cache, no-transform' },
						// a comment every 15 s keeps proxies from closing a slow reply
						keepAliveMs: 15_000,
					})
				);
			}
		);
	};
}

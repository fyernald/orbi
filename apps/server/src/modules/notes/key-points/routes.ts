import { keyPointsInput, topicParams } from '@orbi/shared';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { routeLimit, type RateLimits } from '../../../rate-limit';
import type { RequireUser } from '../../auth/session';
import { keyPointsStream } from './stream';
import type { PrepareKeyPoints } from './writer';

type KeyPointRoutesDeps = {
	prepareKeyPoints: PrepareKeyPoints;
	requireUser: RequireUser;
	limits: RateLimits;
};

export function createKeyPointRoutes({
	prepareKeyPoints,
	requireUser,
	limits,
}: KeyPointRoutesDeps): FastifyPluginAsyncZod {
	return async (api) => {
		// streams the progress and the saved notes, one JSON object per line
		api.post(
			'/courses/:courseId/topics/:topicId/notes/key-points',
			{
				schema: { params: topicParams, body: keyPointsInput },
				config: routeLimit(limits.keyPoints),
			},
			async (request, reply) => {
				const userId = await requireUser(request);
				const { courseId, topicId } = request.params;
				const job = await prepareKeyPoints(
					userId,
					courseId,
					topicId,
					request.body
				);
				// Cancel in the browser, or a closed tab, ends the request: the model stops too
				const controller = new AbortController();
				reply.raw.on('close', () => {
					if (!reply.raw.writableFinished) controller.abort();
				});
				return reply.send(
					new Response(keyPointsStream(job, controller.signal), {
						headers: {
							'content-type': 'application/x-ndjson; charset=utf-8',
							// no-transform: a proxy that gzips (the Next.js dev rewrite does)
							// holds the progress back until the end
							'cache-control': 'no-cache, no-transform',
						},
					})
				);
			}
		);
	};
}

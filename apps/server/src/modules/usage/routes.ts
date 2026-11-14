import { aiUsage } from '@orbi/shared';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import type { RequireUser } from '../auth/session';
import type { UsageService } from './service';

type UsageRoutesDeps = {
	usage: UsageService;
	requireUser: RequireUser;
};

export function createUsageRoutes({
	usage,
	requireUser,
}: UsageRoutesDeps): FastifyPluginAsyncZod {
	return async (api) => {
		// the student's own AI usage; the client only shows it, the server decides
		api.get(
			'/usage',
			{ schema: { response: { 200: aiUsage } } },
			async (request) => usage.getUsage(await requireUser(request))
		);
	};
}

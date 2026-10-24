import type { FastifyPluginAsync } from 'fastify';
import type { Auth } from '../../auth';
import { sendWebResponse, toWebRequest } from './web-bridge';

// Better Auth is this module's service and repository, so routes.ts is the only file.
// It serves sign-up, sign-in, sign-out, and the session under /api/auth/*.
export function createAuthRoutes({ auth }: { auth: Auth }): FastifyPluginAsync {
	return async (api) => {
		api.route({
			method: ['GET', 'POST'],
			url: '/auth/*',
			handler: async (request, reply) =>
				sendWebResponse(reply, await auth.handler(toWebRequest(request))),
		});
	};
}

import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyRequest } from 'fastify';
import type { Auth } from '../../auth';
import { UnauthorizedError } from '../../errors';

// gives the id of the logged-in user, or answers 401; every route with user data calls it first
export type RequireUser = (request: FastifyRequest) => Promise<string>;

export function createRequireUser(auth: Auth): RequireUser {
	return async (request) => {
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(request.headers),
		});
		if (!session) throw new UnauthorizedError();
		return session.user.id;
	};
}

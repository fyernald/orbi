import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyRequest } from 'fastify';
import type { Auth } from '../../auth';
import { UnauthorizedError } from '../../errors';

// gives the id of the logged-in user, or answers 401; every route with user data calls it first
export type RequireUser = (request: FastifyRequest) => Promise<string>;

export function createRequireUser(auth: Auth): RequireUser {
	// A route can check before its body arrives and ask again in its handler, so
	// the answer is kept for the request and the session is looked up once.
	const checked = new WeakMap<FastifyRequest, Promise<string>>();

	async function lookUp(request: FastifyRequest) {
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(request.headers),
		});
		if (!session) throw new UnauthorizedError();
		return session.user.id;
	}

	return (request) => {
		let userId = checked.get(request);
		if (!userId) {
			userId = lookUp(request);
			checked.set(request, userId);
		}
		return userId;
	};
}

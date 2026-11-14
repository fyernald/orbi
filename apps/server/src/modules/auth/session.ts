import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyRequest } from 'fastify';
import type { Auth } from '../../auth';
import { UnauthorizedError } from '../../errors';

// what the routes may know about the logged-in user
export type SessionUser = { id: string; email: string; emailVerified: boolean };

// gives the logged-in user, or answers 401
export type RequireLogin = (request: FastifyRequest) => Promise<SessionUser>;

// gives the id of a user who may use the app, or answers 401 (or 403 without
// beta access); every route with user data calls it first
export type RequireUser = (request: FastifyRequest) => Promise<string>;

// A route can check before its body arrives and ask again in its handler, so
// each answer is kept for the request and worked out once.
function oncePerRequest<T>(
	work: (request: FastifyRequest) => Promise<T>
): (request: FastifyRequest) => Promise<T> {
	const checked = new WeakMap<FastifyRequest, Promise<T>>();
	return (request) => {
		let answer = checked.get(request);
		if (!answer) {
			answer = work(request);
			checked.set(request, answer);
		}
		return answer;
	};
}

export function createRequireLogin(auth: Auth): RequireLogin {
	return oncePerRequest(async (request) => {
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(request.headers),
		});
		if (!session) throw new UnauthorizedError();
		const { id, email, emailVerified } = session.user;
		return { id, email, emailVerified };
	});
}

// `allow` throws for a user who is logged in but may not use the app yet
export function createRequireUser(
	requireLogin: RequireLogin,
	allow: (user: SessionUser) => Promise<void> = async () => {}
): RequireUser {
	return oncePerRequest(async (request) => {
		const user = await requireLogin(request);
		await allow(user);
		return user.id;
	});
}

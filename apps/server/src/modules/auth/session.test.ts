import type { FastifyRequest } from 'fastify';
import { describe, expect, it, vi } from 'vitest';
import type { Auth } from '../../auth';
import { BetaAccessError, UnauthorizedError } from '../../errors';
import { createRequireLogin, createRequireUser } from './session';

const ada = { id: 'ada', email: 'ada@test.dev', emailVerified: true };

// only the session lookup is used, so the rest of Better Auth is left out
function fakeAuth(session: { user: typeof ada } | null) {
	const getSession = vi.fn(async () => session);
	return { auth: { api: { getSession } } as unknown as Auth, getSession };
}

const request = () => ({ headers: {} }) as FastifyRequest;

describe('createRequireLogin', () => {
	it('gives the logged-in user', async () => {
		const { auth } = fakeAuth({ user: { ...ada, name: 'Ada' } as typeof ada });

		expect(await createRequireLogin(auth)(request())).toEqual(ada);
	});

	it('answers 401 without a session', async () => {
		const { auth } = fakeAuth(null);

		await expect(createRequireLogin(auth)(request())).rejects.toBeInstanceOf(
			UnauthorizedError
		);
	});

	it('looks the session up once per request', async () => {
		const { auth, getSession } = fakeAuth({ user: ada });
		const requireLogin = createRequireLogin(auth);
		const first = request();

		await requireLogin(first);
		await requireLogin(first);
		await requireLogin(request());

		expect(getSession).toHaveBeenCalledTimes(2);
	});
});

describe('createRequireUser', () => {
	it('gives the id of a user who is let in', async () => {
		const { auth } = fakeAuth({ user: ada });

		expect(await createRequireUser(createRequireLogin(auth))(request())).toBe(
			'ada'
		);
	});

	it('refuses a user who is not let in, and checks once per request', async () => {
		const { auth } = fakeAuth({ user: ada });
		const allow = vi.fn(async () => {
			throw new BetaAccessError();
		});
		const requireUser = createRequireUser(createRequireLogin(auth), allow);
		const first = request();

		await expect(requireUser(first)).rejects.toBeInstanceOf(BetaAccessError);
		await expect(requireUser(first)).rejects.toBeInstanceOf(BetaAccessError);

		expect(allow).toHaveBeenCalledTimes(1);
		expect(allow).toHaveBeenCalledWith(ada);
	});
});

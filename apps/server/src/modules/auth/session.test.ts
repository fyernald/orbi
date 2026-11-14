import type { FastifyRequest } from 'fastify';
import { describe, expect, it, vi } from 'vitest';
import type { Auth } from '../../auth';
import { UnauthorizedError } from '../../errors';
import { createRequireUser } from './session';

// only the session lookup is used, so the rest of Better Auth is left out
function fakeAuth(session: { user: { id: string } } | null) {
	const getSession = vi.fn(async () => session);
	return { auth: { api: { getSession } } as unknown as Auth, getSession };
}

const request = () => ({ headers: {} }) as FastifyRequest;

describe('createRequireUser', () => {
	it('gives the id of the logged-in user', async () => {
		const { auth } = fakeAuth({ user: { id: 'ada' } });

		expect(await createRequireUser(auth)(request())).toBe('ada');
	});

	it('answers 401 without a session', async () => {
		const { auth } = fakeAuth(null);

		await expect(createRequireUser(auth)(request())).rejects.toBeInstanceOf(
			UnauthorizedError
		);
	});

	it('looks the session up once per request', async () => {
		const { auth, getSession } = fakeAuth({ user: { id: 'ada' } });
		const requireUser = createRequireUser(auth);
		const first = request();

		await requireUser(first);
		await requireUser(first);
		await requireUser(request());

		expect(getSession).toHaveBeenCalledTimes(2);
	});
});

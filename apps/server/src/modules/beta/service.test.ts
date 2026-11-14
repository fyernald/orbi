import { describe, expect, it } from 'vitest';
import type { BetaRepository } from './repository';
import { createBetaService } from './service';

// a student who never used a key
const noAccess: BetaRepository = {
	findAccessEnd: async () => null,
	redeemKey: async () => null,
	addKeys: async () => {},
};

const options = {
	keysRequired: true,
	adminEmails: ['dev@orbi.study'],
	accessDays: 30,
	requireVerifiedEmail: true,
};

describe('the beta service', () => {
	it('lets an admin in only once their email is confirmed', async () => {
		const beta = createBetaService({ repo: noAccess, options });
		const admin = { id: 'dev', email: 'DEV@orbi.study', emailVerified: true };

		expect((await beta.getAccess(admin)).hasAccess).toBe(true);
		expect(
			(await beta.getAccess({ ...admin, emailVerified: false })).hasAccess
		).toBe(false);
	});

	it('lets everyone in when keys are not required', async () => {
		const beta = createBetaService({
			repo: noAccess,
			options: { ...options, keysRequired: false },
		});

		await expect(
			beta.requireAccess({
				id: 'ada',
				email: 'ada@test.dev',
				emailVerified: false,
			})
		).resolves.toBeUndefined();
	});
});

import type { BetaAccess } from '@orbi/shared';
import { BetaAccessError, ValidationError } from '../../errors';
import type { SessionUser } from '../auth/session';
import { hashBetaKey, normalizeBetaKey } from './keys';
import type { BetaRepository } from './repository';

export interface BetaService {
	getAccess(user: SessionUser): Promise<BetaAccess>;
	// throws for a student without access; the gate in front of every app route
	requireAccess(user: SessionUser): Promise<void>;
	redeem(user: SessionUser, typedKey: string): Promise<BetaAccess>;
}

export type BetaOptions = {
	// off for local runs and the tests, so nobody needs a key there
	keysRequired: boolean;
	// developers get in without a key, still with the usage limits
	adminEmails: string[];
	// how many days one key gives
	accessDays: number;
	// an admin email only counts once it is confirmed, where the server confirms emails
	requireVerifiedEmail: boolean;
};

export const BETA_ACCESS_DAYS_DEFAULT = 30;

// the same message for a wrong, used or unknown key, so nobody can tell which exist
const NOT_VALID = 'This key is not valid.';

export function createBetaService({
	repo,
	options,
	now = () => new Date(),
}: {
	repo: BetaRepository;
	options: BetaOptions;
	now?: () => Date;
}): BetaService {
	const admins = new Set(
		options.adminEmails.map((email) => email.toLowerCase())
	);
	const isAdmin = ({ email, emailVerified }: SessionUser) =>
		admins.has(email.toLowerCase()) &&
		(emailVerified || !options.requireVerifiedEmail);

	async function getAccess(user: SessionUser): Promise<BetaAccess> {
		if (!options.keysRequired || isAdmin(user)) {
			return { hasAccess: true, endsAt: null };
		}
		const endsAt = await repo.findAccessEnd(user.id);
		return {
			hasAccess: endsAt !== null && endsAt > now(),
			endsAt: endsAt?.toISOString() ?? null,
		};
	}

	return {
		getAccess,

		async requireAccess(user) {
			if (!(await getAccess(user)).hasAccess) throw new BetaAccessError();
		},

		async redeem(user, typedKey) {
			const key = normalizeBetaKey(typedKey);
			if (!key) throw new ValidationError(NOT_VALID);
			const endsAt = await repo.redeemKey(
				user.id,
				hashBetaKey(key),
				options.accessDays,
				now()
			);
			if (!endsAt) throw new ValidationError(NOT_VALID);
			return getAccess(user);
		},
	};
}

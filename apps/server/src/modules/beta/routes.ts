import { betaAccess, redeemBetaKeyInput } from '@orbi/shared';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import type { RateLimits } from '../../rate-limit';
import type { RequireLogin } from '../auth/session';
import type { BetaService } from './service';

type BetaRoutesDeps = {
	beta: BetaService;
	// these routes are for students without access too, so only the login is checked
	requireLogin: RequireLogin;
	limits: RateLimits;
};

export function createBetaRoutes({
	beta,
	requireLogin,
	limits,
}: BetaRoutesDeps): FastifyPluginAsyncZod {
	return async (api) => {
		api.get(
			'/beta/access',
			{ schema: { response: { 200: betaAccess } } },
			async (request) => beta.getAccess(await requireLogin(request))
		);

		api.post(
			'/beta/redeem',
			{
				schema: { body: redeemBetaKeyInput, response: { 200: betaAccess } },
				// a few tries, so nobody can guess keys one after another
				config: {
					rateLimit: { max: limits.betaKey, timeWindow: '15 minutes' },
				},
			},
			async (request) =>
				beta.redeem(await requireLogin(request), request.body.key)
		);
	};
}

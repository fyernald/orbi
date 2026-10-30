import { profile, updateProfileInput } from '@orbi/shared';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import type { RequireUser } from '../auth/session';
import type { ProfileService } from './service';

type ProfileRoutesDeps = {
	profiles: ProfileService;
	requireUser: RequireUser;
};

export function createProfileRoutes({
	profiles,
	requireUser,
}: ProfileRoutesDeps): FastifyPluginAsyncZod {
	return async (api) => {
		api.get(
			'/profile',
			{ schema: { response: { 200: profile } } },
			async (request) => profiles.getProfile(await requireUser(request))
		);

		api.patch(
			'/profile',
			{ schema: { body: updateProfileInput, response: { 200: profile } } },
			async (request) =>
				profiles.saveProfile(await requireUser(request), request.body)
		);

		api.post(
			'/profile/onboarding',
			{ schema: { response: { 200: profile } } },
			async (request) => profiles.finishOnboarding(await requireUser(request))
		);
	};
}

import {
	onboardingAnswers,
	type Profile,
	type UpdateProfileInput,
} from '@orbi/shared';
import { ValidationError } from '../../errors';
import type { ProfileRepository } from './repository';

export interface ProfileService {
	getProfile(userId: string): Promise<Profile>;
	saveProfile(userId: string, input: UpdateProfileInput): Promise<Profile>;
	finishOnboarding(userId: string): Promise<Profile>;
}

// a new user has no profile row yet; they get one with every question open
const emptyProfile: Profile = {
	preferredName: null,
	birthDate: null,
	uses: [],
	educationLevel: null,
	fieldOfStudy: null,
	interests: [],
	explanationStyle: null,
	dailyMinutes: null,
	studyTime: null,
	locale: null,
	timezone: null,
	onboardedAt: null,
};

export function createProfileService({
	repo,
}: {
	repo: ProfileRepository;
}): ProfileService {
	const getProfile = async (userId: string) =>
		(await repo.findProfile(userId)) ?? emptyProfile;

	return {
		getProfile,
		saveProfile: (userId, input) => repo.saveProfile(userId, input),

		// the app opens only when every question has an answer
		async finishOnboarding(userId) {
			const current = await getProfile(userId);
			if (!onboardingAnswers.safeParse(current).success) {
				throw new ValidationError('Answer every question first.');
			}
			return repo.markOnboarded(userId);
		},
	};
}

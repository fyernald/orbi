import {
	onboardingAnswers,
	type Profile,
	type UpdateProfileInput,
} from '@orbi/shared';
import { MODEL_NOT_IN_LIST, type ModelRegistry } from '../../ai/models';
import { ValidationError } from '../../errors';
import type { ProfileRepository } from './repository';

export interface ProfileService {
	getProfile(userId: string): Promise<Profile>;
	saveProfile(userId: string, input: UpdateProfileInput): Promise<Profile>;
	finishOnboarding(userId: string): Promise<Profile>;
	// finished or skipped: the tour does not start by itself again
	finishTour(userId: string): Promise<Profile>;
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
	reminderEnabled: false,
	reminderTime: null,
	defaultModelId: null,
	onboardedAt: null,
	tourSeenAt: null,
};

export function createProfileService({
	repo,
	models,
}: {
	repo: ProfileRepository;
	// only a model this server can call is saved as the default
	models: Pick<ModelRegistry, 'has'>;
}): ProfileService {
	const getProfile = async (userId: string) =>
		(await repo.findProfile(userId)) ?? emptyProfile;

	return {
		getProfile,
		async saveProfile(userId, input) {
			const { defaultModelId } = input;
			if (defaultModelId && !models.has(defaultModelId)) {
				throw new ValidationError(MODEL_NOT_IN_LIST);
			}
			return repo.saveProfile(userId, input);
		},

		// the app opens only when every question has an answer
		async finishOnboarding(userId) {
			const current = await getProfile(userId);
			if (!onboardingAnswers.safeParse(current).success) {
				throw new ValidationError('Answer every question first.');
			}
			return repo.markOnboarded(userId);
		},

		finishTour: (userId) => repo.markTourSeen(userId),
	};
}

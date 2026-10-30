import type { Profile, UpdateProfileInput } from '@orbi/shared';
import { eq, sql } from 'drizzle-orm';
import type { Db } from '../../db';
import { profile } from '../../db/schema';

export interface ProfileRepository {
	findProfile(userId: string): Promise<Profile | undefined>;
	// creates the profile the first time the user saves an answer
	saveProfile(userId: string, input: UpdateProfileInput): Promise<Profile>;
	markOnboarded(userId: string): Promise<Profile>;
}

const profileColumns = {
	preferredName: profile.preferredName,
	birthDate: profile.birthDate,
	uses: profile.uses,
	educationLevel: profile.educationLevel,
	fieldOfStudy: profile.fieldOfStudy,
	interests: profile.interests,
	explanationStyle: profile.explanationStyle,
	dailyMinutes: profile.dailyMinutes,
	studyTime: profile.studyTime,
	locale: profile.locale,
	timezone: profile.timezone,
	onboardedAt: profile.onboardedAt,
};

type ProfileRow = Pick<
	typeof profile.$inferSelect,
	keyof typeof profileColumns
>;

// the database keeps plain text and numbers; the shared schema checked them on the way in
const toProfile = ({ onboardedAt, ...row }: ProfileRow): Profile =>
	({
		...row,
		onboardedAt: onboardedAt?.toISOString() ?? null,
	}) as Profile;

export function createProfileRepository(db: Db): ProfileRepository {
	return {
		async findProfile(userId) {
			const [found] = await db
				.select(profileColumns)
				.from(profile)
				.where(eq(profile.userId, userId));
			return found && toProfile(found);
		},

		async saveProfile(userId, input) {
			const [saved] = await db
				.insert(profile)
				.values({ userId, ...input })
				.onConflictDoUpdate({ target: profile.userId, set: input })
				.returning(profileColumns);
			return toProfile(saved!);
		},

		async markOnboarded(userId) {
			const [saved] = await db
				.update(profile)
				// finishing twice keeps the first time
				.set({ onboardedAt: sql`coalesce(${profile.onboardedAt}, now())` })
				.where(eq(profile.userId, userId))
				.returning(profileColumns);
			return toProfile(saved!);
		},
	};
}

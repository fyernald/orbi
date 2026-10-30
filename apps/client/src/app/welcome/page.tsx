import type { Metadata } from 'next';
import { getServerSession } from '@/features/auth/server';
import { OnboardingExit } from '@/features/onboarding/components/onboarding-exit';
import { OnboardingFlow } from '@/features/onboarding/components/onboarding-flow';
import { getServerProfile } from '@/features/profile/server';

export const metadata: Metadata = { title: 'Welcome' };

// the layout has checked the session; both calls are cached for this request
export default async function WelcomePage() {
	const session = await getServerSession();
	const saved = await getServerProfile();

	return (
		<OnboardingExit>
			<OnboardingFlow saved={saved} name={session?.user.name ?? ''} />
		</OnboardingExit>
	);
}

import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { RequireSession } from '@/features/auth/components/require-session';
import { SessionBoundary } from '@/features/auth/components/session-boundary';
import { getServerSession } from '@/features/auth/server';
import { getServerProfile, isOnboarded } from '@/features/profile/server';
import { routes } from '@/lib/routes';

// only for a logged-in user who has not finished onboarding; checked on the server,
// so a finished user never sees it again, not even for a moment
export default async function WelcomeLayout({
	children,
}: {
	children: ReactNode;
}) {
	const session = await getServerSession();
	if (!session) redirect(routes.login);
	if (isOnboarded(await getServerProfile())) redirect(routes.app);

	return (
		<SessionBoundary session={session}>
			<RequireSession>{children}</RequireSession>
		</SessionBoundary>
	);
}

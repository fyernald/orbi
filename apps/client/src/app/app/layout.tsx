import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppArrival } from '@/features/app-shell/components/app-arrival';
import { AppShell } from '@/features/app-shell/components/app-shell';
import { getSidebarCollapsed } from '@/features/app-shell/server';
import { RequireSession } from '@/features/auth/components/require-session';
import { SessionBoundary } from '@/features/auth/components/session-boundary';
import { getServerSession } from '@/features/auth/server';
import { getServerBetaAccess } from '@/features/beta/server';
import { getServerProfile, isOnboarded } from '@/features/profile/server';
import { routes } from '@/lib/routes';

// every page under /app needs an account, beta access and a finished onboarding; checked
// on the server before anything is sent, so a new user never sees the app before then
export default async function AppLayout({ children }: { children: ReactNode }) {
	const session = await getServerSession();
	if (!session) redirect(routes.login);
	if (!(await getServerBetaAccess()).hasAccess) redirect(routes.betaKey);
	if (!isOnboarded(await getServerProfile())) redirect(routes.welcome);
	const sidebarCollapsed = await getSidebarCollapsed();

	return (
		<SessionBoundary session={session}>
			<RequireSession>
				<AppArrival>
					<AppShell defaultCollapsed={sidebarCollapsed}>{children}</AppShell>
				</AppArrival>
			</RequireSession>
		</SessionBoundary>
	);
}

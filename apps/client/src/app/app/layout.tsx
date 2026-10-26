import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppShell } from '@/features/app-shell/components/app-shell';
import { RequireSession } from '@/features/auth/components/require-session';
import { SessionBoundary } from '@/features/auth/components/session-boundary';
import { getServerSession } from '@/features/auth/server';
import { routes } from '@/lib/routes';

// every page under /app needs an account; checked on the server before anything is sent
export default async function AppLayout({ children }: { children: ReactNode }) {
	const session = await getServerSession();
	if (!session) redirect(routes.login);

	return (
		<SessionBoundary session={session}>
			<RequireSession>
				<AppShell>{children}</AppShell>
			</RequireSession>
		</SessionBoundary>
	);
}

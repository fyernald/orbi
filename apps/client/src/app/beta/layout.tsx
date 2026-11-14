import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AuthFrame } from '@/features/auth/components/auth-frame';
import { RequireSession } from '@/features/auth/components/require-session';
import { SessionBoundary } from '@/features/auth/components/session-boundary';
import { SignOutButton } from '@/features/auth/components/sign-out-button';
import { getServerSession } from '@/features/auth/server';
import { getServerBetaAccess } from '@/features/beta/server';
import { routes } from '@/lib/routes';

// only for a logged-in student without beta access; checked on the server, so a
// student with access goes straight on to the app
export default async function BetaKeyLayout({
	children,
}: {
	children: ReactNode;
}) {
	const session = await getServerSession();
	if (!session) redirect(routes.login);
	if ((await getServerBetaAccess()).hasAccess) redirect(routes.app);

	return (
		<SessionBoundary session={session}>
			<RequireSession>
				<AuthFrame action={<SignOutButton className="rounded-full" />}>
					{children}
				</AuthFrame>
			</RequireSession>
		</SessionBoundary>
	);
}

import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { GuestOnly } from '@/features/auth/components/guest-only';
import { SessionBoundary } from '@/features/auth/components/session-boundary';
import { getServerSession } from '@/features/auth/server';
import { routes } from '@/lib/routes';

// checked on the server, so a logged-in user never sees these pages, not even for a moment
export default async function AuthLayout({
	children,
}: {
	children: ReactNode;
}) {
	const session = await getServerSession();
	if (session) redirect(routes.app);

	return (
		<SessionBoundary session={session}>
			<GuestOnly>
				<main className="flex min-h-svh items-center justify-center p-4">
					<div className="w-full max-w-sm">{children}</div>
				</main>
			</GuestOnly>
		</SessionBoundary>
	);
}

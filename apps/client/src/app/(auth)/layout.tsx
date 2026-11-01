import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { OrbiLogo } from '@/components/brand/orbi-logo';
import { AuthShowcase } from '@/features/auth/components/auth-showcase';
import { AuthFormSlot } from '@/features/auth/components/auth-welcome';
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
				{/* the form on the left, the night sky on the right; phones show only the form */}
				<main className="grid min-h-svh lg:grid-cols-2 lg:gap-3 lg:p-3">
					<div className="relative flex flex-col px-6 py-6 sm:px-10 lg:py-7">
						<div
							aria-hidden="true"
							className="sky-glow pointer-events-none absolute inset-x-0 top-0 h-96 lg:hidden"
						/>
						<OrbiLogo className="relative" />
						<div className="relative flex flex-1 items-center justify-center py-12">
							<div className="w-full max-w-sm">
								<AuthFormSlot>{children}</AuthFormSlot>
							</div>
						</div>
					</div>
					<AuthShowcase className="sticky top-3 hidden h-[calc(100svh-1.5rem)] min-h-[40rem] lg:flex" />
				</main>
			</GuestOnly>
		</SessionBoundary>
	);
}

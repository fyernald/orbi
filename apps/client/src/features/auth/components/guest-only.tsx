'use client';

import type { ReactNode } from 'react';
import { PageLoader } from '@/components/page-loader';
import { useRedirect } from '@/hooks/use-redirect';
import { routes } from '@/lib/routes';
import { useSession } from '../hooks';

// for the login and sign-up pages: a logged-in user goes straight to the app
export function GuestOnly({ children }: { children: ReactNode }) {
	const { data: session } = useSession();
	useRedirect(Boolean(session), routes.home);

	if (session) return <PageLoader />;
	return children;
}

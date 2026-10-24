'use client';

import type { ReactNode } from 'react';
import { PageLoader } from '@/components/page-loader';
import { useRedirect } from '@/hooks/use-redirect';
import { routes } from '@/lib/routes';
import { useSession } from '../hooks';

// sends the user into the app once they log in or sign up on these pages
export function GuestOnly({ children }: { children: ReactNode }) {
	const { data: session } = useSession();
	useRedirect(Boolean(session), routes.app);

	if (session) return <PageLoader />;
	return children;
}

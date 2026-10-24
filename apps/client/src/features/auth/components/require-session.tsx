'use client';

import type { ReactNode } from 'react';
import { PageLoader } from '@/components/page-loader';
import { useRedirect } from '@/hooks/use-redirect';
import { routes } from '@/lib/routes';
import { useSession } from '../hooks';

// sends the user to the login page once they log out on these pages
export function RequireSession({ children }: { children: ReactNode }) {
	const { data: session, isPending } = useSession();
	useRedirect(!isPending && !session, routes.login);

	if (!session) return <PageLoader />;
	return children;
}

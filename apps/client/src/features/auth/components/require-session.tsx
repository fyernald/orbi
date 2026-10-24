'use client';

import type { ReactNode } from 'react';
import { PageLoader } from '@/components/page-loader';
import { useRedirect } from '@/hooks/use-redirect';
import { routes } from '@/lib/routes';
import { useSession } from '../hooks';

// shows its pages only to logged-in users, everyone else goes to the login page
export function RequireSession({ children }: { children: ReactNode }) {
	const { data: session, isPending } = useSession();
	useRedirect(!isPending && !session, routes.login);

	if (!session) return <PageLoader />;
	return children;
}

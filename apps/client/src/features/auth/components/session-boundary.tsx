import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { sessionQueryKey, type Session } from '../session-query';

type SessionBoundaryProps = {
	session: Session;
	children: ReactNode;
};

// Puts the session the server checked into the client cache, so the page renders at once.
// It is marked as old, so the browser checks again in the background and gets a fresh cookie.
export function SessionBoundary({ session, children }: SessionBoundaryProps) {
	const queryClient = new QueryClient();
	queryClient.setQueryData(sessionQueryKey, session, { updatedAt: 0 });

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			{children}
		</HydrationBoundary>
	);
}

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { Session } from '../server';
import { sessionQueryKey } from '../session-query';

type SessionBoundaryProps = {
	session: Session;
	children: ReactNode;
};

// hands the session the server already checked to the client cache, so the page never asks again
export function SessionBoundary({ session, children }: SessionBoundaryProps) {
	const queryClient = new QueryClient();
	queryClient.setQueryData(sessionQueryKey, session);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			{children}
		</HydrationBoundary>
	);
}

'use client';

import { usePathname } from 'next/navigation';
import {
	createContext,
	useContext,
	useState,
	ViewTransition,
	type ReactNode,
} from 'react';
import { PageLoader } from '@/components/page-loader';
import { useRedirect } from '@/hooks/use-redirect';
import { routes } from '@/lib/routes';
import { transitionTypes } from '@/lib/transitions';
import { useSession } from '../hooks';

export type Arrival = 'login' | 'signup';

// set once the user logs in or signs up on these pages, while the welcome screen shows
const ArrivalContext = createContext<Arrival | null>(null);

export const useArrival = () => useContext(ArrivalContext);

// A session that starts on these pages (from the form, or from another tab) gets a
// short welcome before the app opens. A session that was there from the start goes
// straight to the app.
export function GuestOnly({ children }: { children: ReactNode }) {
	const { data: session } = useSession();
	const pathname = usePathname();
	const [startedAsGuest] = useState(!session);
	useRedirect(Boolean(session) && !startedAsGuest, routes.app);

	if (session && !startedAsGuest) return <PageLoader />;

	const arrival: Arrival | null = session
		? pathname === routes.signup
			? 'signup'
			: 'login'
		: null;

	return (
		<ArrivalContext value={arrival}>
			{/* flies away into the app, like the end of onboarding */}
			<ViewTransition
				exit={{
					[transitionTypes.enterApp]: 'onboarding-leave',
					default: 'none',
				}}
				default="none"
			>
				{children}
			</ViewTransition>
		</ArrivalContext>
	);
}

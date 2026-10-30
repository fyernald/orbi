import { ViewTransition, type ReactNode } from 'react';
import { transitionTypes } from '@/lib/transitions';

// the app grows into place when the student arrives from onboarding; other visits show it at once
export function AppArrival({ children }: { children: ReactNode }) {
	return (
		<ViewTransition
			enter={{ [transitionTypes.enterApp]: 'app-arrive', default: 'none' }}
			default="none"
		>
			{children}
		</ViewTransition>
	);
}

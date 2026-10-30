import { ViewTransition, type ReactNode } from 'react';
import { transitionTypes } from '@/lib/transitions';

// onboarding flies away when it hands over to the app; any other navigation just swaps
export function OnboardingExit({ children }: { children: ReactNode }) {
	return (
		<ViewTransition
			exit={{ [transitionTypes.enterApp]: 'onboarding-leave', default: 'none' }}
			default="none"
		>
			{children}
		</ViewTransition>
	);
}

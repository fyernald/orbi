import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { StepDirection } from '../use-step-transition';

type StepTransitionProps = {
	stepKey: string;
	direction: StepDirection;
	leaving: boolean;
	children: ReactNode;
};

// a new key mounts the next step fresh, so its enter animation plays from the start
export function StepTransition({
	stepKey,
	direction,
	leaving,
	children,
}: StepTransitionProps) {
	return (
		<div
			key={stepKey}
			className={cn(
				'flex flex-col gap-8',
				direction === 'forward' ? 'step-forward' : 'step-back',
				leaving ? 'step-leave' : 'step-enter'
			)}
		>
			{children}
		</div>
	);
}

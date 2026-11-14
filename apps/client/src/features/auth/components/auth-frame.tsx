import type { ReactNode } from 'react';
import { OrbiLogo } from '@/components/brand/orbi-logo';
import { AuthShowcase } from './auth-showcase';

type AuthFrameProps = {
	// beside the logo, for example a log out button
	action?: ReactNode;
	children: ReactNode;
};

// the form on the left, the night sky on the right; phones show only the form
export function AuthFrame({ action, children }: AuthFrameProps) {
	return (
		<main className="grid min-h-svh lg:grid-cols-2 lg:gap-3 lg:p-3">
			<div className="relative flex flex-col px-6 py-6 sm:px-10 lg:py-7">
				<div
					aria-hidden="true"
					className="sky-glow pointer-events-none absolute inset-x-0 top-0 h-96 lg:hidden"
				/>
				<div className="relative flex items-center justify-between gap-3">
					<OrbiLogo />
					{action}
				</div>
				<div className="relative flex flex-1 items-center justify-center py-12">
					<div className="w-full max-w-sm">{children}</div>
				</div>
			</div>
			<AuthShowcase className="sticky top-3 hidden h-[calc(100svh-1.5rem)] min-h-[40rem] lg:flex" />
		</main>
	);
}

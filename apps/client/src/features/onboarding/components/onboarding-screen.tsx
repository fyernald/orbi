import type { ReactNode } from 'react';
import { OrbiLogo } from '@/components/brand/orbi-logo';
import { SignOutButton } from '@/features/auth/components/sign-out-button';

type OnboardingScreenProps = {
	sky: ReactNode;
	progress: ReactNode;
	// left out on the "all set" screen, which moves on by itself
	footer?: ReactNode;
	children: ReactNode;
};

// the full-screen frame: no sidebar, just the question in the middle and one action at the bottom
export function OnboardingScreen({
	sky,
	progress,
	footer,
	children,
}: OnboardingScreenProps) {
	return (
		<div className="relative isolate flex min-h-svh flex-col">
			{sky}
			<header className="flex items-center justify-between px-4 py-4 sm:px-8">
				<OrbiLogo />
				<SignOutButton className="rounded-full" />
			</header>
			<div className="mx-auto w-full max-w-2xl px-4 sm:px-6">{progress}</div>
			<main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-10 pb-36 sm:px-6 sm:pt-14">
				{children}
			</main>
			{footer && (
				<footer className="fixed inset-x-0 bottom-0 border-t border-divider bg-background/75 backdrop-blur-md">
					<div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-4 sm:px-6">
						{footer}
					</div>
				</footer>
			)}
		</div>
	);
}

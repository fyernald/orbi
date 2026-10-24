import type { ReactNode } from 'react';
import { GuestOnly } from '@/features/auth/components/guest-only';

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<GuestOnly>
			<main className="flex min-h-svh items-center justify-center p-4">
				<div className="w-full max-w-sm">{children}</div>
			</main>
		</GuestOnly>
	);
}

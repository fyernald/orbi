import type { ReactNode } from 'react';
import { RequireSession } from '@/features/auth/components/require-session';

// every page in this group needs an account
export default function AppLayout({ children }: { children: ReactNode }) {
	return <RequireSession>{children}</RequireSession>;
}

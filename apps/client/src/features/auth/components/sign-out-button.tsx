'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { useSignOut } from '../hooks';

// the page guard sends the user to the login page once the session is gone
export function SignOutButton({ className }: { className?: string }) {
	const signOut = useSignOut();

	return (
		<Button
			// it can sit inside a form without submitting it
			type="button"
			variant="ghost"
			disabled={signOut.isPending}
			onClick={() => signOut.mutate()}
			className={cn('text-muted-foreground', className)}
		>
			{signOut.isPending ? <Spinner /> : <LogOut />}
			Log out
		</Button>
	);
}

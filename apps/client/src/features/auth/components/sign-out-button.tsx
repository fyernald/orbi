'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useSignOut } from '../hooks';

// the page guard sends the user to the login page once the session is gone
export function SignOutButton() {
	const signOut = useSignOut();

	return (
		<Button
			variant="outline"
			disabled={signOut.isPending}
			onClick={() => signOut.mutate()}
		>
			{signOut.isPending && <Spinner />}
			Log out
		</Button>
	);
}

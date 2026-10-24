'use client';

import { useSession } from '../hooks';

export function CurrentUser() {
	const { data: session } = useSession();
	if (!session) return null;

	const { name, email } = session.user;
	return (
		<p className="text-sm text-muted-foreground">
			Logged in as <span className="font-medium text-foreground">{name}</span> (
			{email})
		</p>
	);
}

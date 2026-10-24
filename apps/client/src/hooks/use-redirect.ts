'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// replaces the current page, so the back button does not return to it
export function useRedirect(when: boolean, to: string) {
	const router = useRouter();

	useEffect(() => {
		if (when) router.replace(to);
	}, [when, to, router]);
}

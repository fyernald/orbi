import 'server-only';

import { profile, type Profile } from '@orbi/shared';
import { headers } from 'next/headers';
import { cache } from 'react';
import { apiUrl } from '@/lib/api-url';

// Asks the API for the logged-in user's profile, with the browser's cookie, before anything
// is rendered. Only call it after getServerSession() found a session.
// cache() lets the layout and the page share one call per request.
export const getServerProfile = cache(async (): Promise<Profile> => {
	const incoming = await headers();
	const response = await fetch(`${apiUrl}/api/profile`, {
		headers: { cookie: incoming.get('cookie') ?? '' },
		cache: 'no-store',
	});
	if (!response.ok) {
		throw new Error(`Could not load the profile (${response.status}).`);
	}
	return profile.parse(await response.json());
});

export const isOnboarded = (current: Profile) => current.onboardedAt !== null;

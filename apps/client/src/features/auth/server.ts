import 'server-only';

import { createAuthClient } from 'better-auth/client';
import { headers } from 'next/headers';
import { cache } from 'react';
import { apiUrl } from '@/lib/api-url';
import { unwrap } from './errors';
import { toSession } from './session-query';

const serverAuthClient = createAuthClient({ baseURL: apiUrl });

// Asks the API who is logged in, with the browser's cookie, before anything is rendered.
// Returns null when nobody is; throws when the API cannot answer, so the error page shows.
// cache() lets the layout and the page share one call per request.
export const getServerSession = cache(async () => {
	const incoming = await headers();
	const forwardedFor = incoming.get('x-forwarded-for');

	const session = unwrap(
		await serverAuthClient.getSession({
			// only the browser can store a refreshed cookie, so it refreshes the session itself
			query: { disableRefresh: true },
			fetchOptions: {
				headers: {
					cookie: incoming.get('cookie') ?? '',
					// the user's address, so the API rate-limits each user and not this server as one
					...(forwardedFor ? { 'x-forwarded-for': forwardedFor } : {}),
				},
			},
		})
	);
	return toSession(session);
});

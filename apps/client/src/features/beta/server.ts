import 'server-only';

import { betaAccess, type BetaAccess } from '@orbi/shared';
import { cache } from 'react';
import { apiUrl, forwardedHeaders } from '@/lib/api-url';

// Asks the API whether the logged-in student may use the app during the beta, before
// anything is rendered. Only call it after getServerSession() found a session.
// cache() lets the layout and the page share one call per request.
export const getServerBetaAccess = cache(async (): Promise<BetaAccess> => {
	const response = await fetch(`${apiUrl}/api/beta/access`, {
		headers: await forwardedHeaders(),
		cache: 'no-store',
	});
	if (!response.ok) {
		throw new Error(`Could not load the beta access (${response.status}).`);
	}
	return betaAccess.parse(await response.json());
});

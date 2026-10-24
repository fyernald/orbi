import 'server-only';

import { createAuthClient } from 'better-auth/client';
import { headers } from 'next/headers';
import { apiUrl } from '@/lib/api-url';
import { unwrap } from './errors';

const serverAuthClient = createAuthClient({ baseURL: apiUrl });

// Asks the API who is logged in, with the browser's cookie, before anything is rendered.
// Returns null when nobody is; throws when the API cannot answer, so the error page shows.
export async function getServerSession() {
	const cookie = (await headers()).get('cookie') ?? '';
	return unwrap(
		await serverAuthClient.getSession({ fetchOptions: { headers: { cookie } } })
	);
}

export type Session = Awaited<ReturnType<typeof getServerSession>>;

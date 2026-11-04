import 'server-only';

import { headers } from 'next/headers';

// Where the Next.js server reaches the API itself: localhost in development,
// the server container in production (API_URL in deploy/compose.yml).
// The browser never uses this; it calls /api on its own origin.
export const apiUrl = process.env.API_URL ?? 'http://localhost:3001';

// What the Next.js server passes on from the browser's request when it calls the
// API: the cookie, so the API knows who is logged in, and the student's address,
// so the API logs and rate-limits each student and not this server as one.
export async function forwardedHeaders(): Promise<Record<string, string>> {
	const incoming = await headers();
	const forwardedFor = incoming.get('x-forwarded-for');
	return {
		cookie: incoming.get('cookie') ?? '',
		...(forwardedFor ? { 'x-forwarded-for': forwardedFor } : {}),
	};
}

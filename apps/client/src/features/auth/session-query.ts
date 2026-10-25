// shared by the client hooks and the server layouts, so both use the same cache entry
export const sessionQueryKey = ['auth', 'session'] as const;

type SessionUser = { id: string; name: string; email: string };

export type Session = { user: SessionUser } | null;

// keeps only what the pages show; the session token, IP, and user agent never reach the page
export function toSession(session: { user: SessionUser } | null): Session {
	if (!session) return null;
	const { id, name, email } = session.user;
	return { user: { id, name, email } };
}

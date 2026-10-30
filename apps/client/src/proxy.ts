import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';
import { routes } from '@/lib/routes';

// A quick first check before any page under /app or /welcome runs: no session cookie,
// straight to login. It only looks at the cookie, so the layouts and the API still check
// the session itself.
export function proxy(request: NextRequest) {
	if (getSessionCookie(request)) return NextResponse.next();
	return NextResponse.redirect(new URL(routes.login, request.url));
}

export const config = { matcher: ['/app/:path*', '/welcome'] };

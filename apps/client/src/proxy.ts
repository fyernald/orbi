import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';
import { publicRoutes, routes } from '@/lib/routes';

// A quick check before the page loads: no session cookie means no account, so go to login.
// It only looks at the cookie; the server checks the session itself on every API call.
export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	if (publicRoutes.includes(pathname) || getSessionCookie(request)) {
		return NextResponse.next();
	}
	return NextResponse.redirect(new URL(routes.login, request.url));
}

export const config = {
	// skip the API, Next.js files, and files with an extension (images, icons)
	matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};

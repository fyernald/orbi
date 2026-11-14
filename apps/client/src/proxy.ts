import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';
import { contentSecurityPolicy, createNonce } from '@/lib/csp';
import { sentryOrigin } from '@/lib/monitoring';
import { routes } from '@/lib/routes';
import { sandboxOrigin } from '@/lib/sandbox';

// Report-Only for now: the browser reports what the policy would block to the API
// log, and blocks nothing. Once the log stays clean it becomes the real header.
const CSP_HEADER = 'Content-Security-Policy-Report-Only';

const needsSession = (pathname: string) =>
	pathname === routes.welcome ||
	pathname === routes.betaKey ||
	pathname.startsWith(routes.app);

export function proxy(request: NextRequest) {
	// A quick first check before any page under /app, /welcome or /beta runs: no session
	// cookie, straight to login. It only looks at the cookie, so the layouts and the
	// API still check the session itself.
	if (needsSession(request.nextUrl.pathname) && !getSessionCookie(request)) {
		return NextResponse.redirect(new URL(routes.login, request.url));
	}

	// Next.js reads the nonce from the request's policy and puts it on its scripts
	const policy = contentSecurityPolicy({
		nonce: createNonce(),
		dev: process.env.NODE_ENV === 'development',
		reportsTo: sentryOrigin,
		framesFrom: sandboxOrigin,
	});
	const headers = new Headers(request.headers);
	headers.set(CSP_HEADER, policy);
	const response = NextResponse.next({ request: { headers } });
	response.headers.set(CSP_HEADER, policy);
	return response;
}

export const config = {
	matcher: [
		{
			// every page, but not the API, built files, or link prefetches
			source:
				'/((?!api|health|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp|ico)$).*)',
			missing: [
				{ type: 'header', key: 'next-router-prefetch' },
				{ type: 'header', key: 'purpose', value: 'prefetch' },
			],
		},
	],
};

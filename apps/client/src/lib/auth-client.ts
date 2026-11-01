import { createAuthClient } from 'better-auth/client';

// Same origin as the app: /api/* reaches the server through the Next.js rewrite
// in development and through nginx in production. Use it only through the auth hooks.
export const authClient = createAuthClient({
	// Better Auth would reload the page at the callbackURL after logging in; the page
	// guards move the user on instead, after the welcome screen
	disableDefaultFetchPlugins: true,
});

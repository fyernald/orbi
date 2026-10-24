import { createAuthClient } from 'better-auth/client';

// Same origin as the app: /api/* reaches the server through the Next.js rewrite
// in development and through nginx in production. Use it only through the auth hooks.
export const authClient = createAuthClient();

import 'server-only';

// Where the Next.js server reaches the API itself: localhost in development,
// the server container in production (API_URL in deploy/compose.yml).
// The browser never uses this; it calls /api on its own origin.
export const apiUrl = process.env.API_URL ?? 'http://localhost:3001';

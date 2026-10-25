// every page path in one place, so links and redirects never drift apart
// (the server's auth emails link to login and forgotPassword, keep them in sync)
export const routes = {
	landing: '/',
	login: '/login',
	signup: '/signup',
	forgotPassword: '/forgot-password',
	resetPassword: '/reset-password',
	app: '/app',
} as const;

// every page path in one place, so links, redirects, and the proxy never drift apart
export const routes = {
	home: '/',
	login: '/login',
	signup: '/signup',
} as const;

// pages anyone can open; every other page needs an account
export const publicRoutes: readonly string[] = [routes.login, routes.signup];

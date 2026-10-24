import Fastify from 'fastify';
import { APP_NAME } from '@orbi/shared';
import type { Auth } from './auth';
import { createAuthRoutes } from './modules/auth/routes';

export type AppDeps = {
	auth: Auth;
};

export function buildApp({ auth }: AppDeps) {
	const app = Fastify({ logger: process.env.NODE_ENV !== 'test' });

	// every route is live under /api, so the reverse proxy can send /api/* to this server
	app.register(
		async (api) => {
			api.get('/health', async () => ({ status: 'ok', app: APP_NAME }));
			api.register(createAuthRoutes({ auth }));
		},
		{ prefix: '/api' }
	);

	return app;
}

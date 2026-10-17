import Fastify from 'fastify';
import { APP_NAME } from '@orbi/shared';

export function buildApp() {
	const app = Fastify({ logger: process.env.NODE_ENV !== 'test' });

	// every route is live under /api, so the reverse proxy can send /api/* to this server
	app.register(
		async (api) => {
			api.get('/health', async () => ({ status: 'ok', app: APP_NAME }));
		},
		{ prefix: '/api' }
	);

	return app;
}

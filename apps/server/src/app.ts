import Fastify from 'fastify';
import {
	serializerCompiler,
	validatorCompiler,
} from 'fastify-type-provider-zod';
import { APP_NAME } from '@orbi/shared';
import type { Auth } from './auth';
import { registerErrorHandler } from './error-handler';
import { requestSerializer } from './log';
import { createAuthRoutes } from './modules/auth/routes';
import { createRequireUser } from './modules/auth/session';
import { createCourseRoutes } from './modules/courses/routes';
import type { CourseService } from './modules/courses/service';
import { createNoteRoutes } from './modules/notes/routes';
import type { NoteService } from './modules/notes/service';
import { createProfileRoutes } from './modules/profile/routes';
import type { ProfileService } from './modules/profile/service';

export type AppDeps = {
	auth: Auth;
	services: {
		courses: CourseService;
		notes: NoteService;
		profiles: ProfileService;
	};
};

export function buildApp({ auth, services }: AppDeps) {
	const app = Fastify({
		logger: process.env.NODE_ENV !== 'test' && {
			serializers: { req: requestSerializer },
		},
	});

	// route schemas are the shared Zod schemas (app-patterns rule 4)
	app.setValidatorCompiler(validatorCompiler);
	app.setSerializerCompiler(serializerCompiler);
	registerErrorHandler(app);

	const requireUser = createRequireUser(auth);

	// every route is live under /api, so the reverse proxy can send /api/* to this server
	app.register(
		async (api) => {
			api.get('/health', async () => ({ status: 'ok', app: APP_NAME }));
			api.register(createAuthRoutes({ auth }));
			api.register(
				createCourseRoutes({ courses: services.courses, requireUser })
			);
			api.register(createNoteRoutes({ notes: services.notes, requireUser }));
			api.register(
				createProfileRoutes({ profiles: services.profiles, requireUser })
			);
		},
		{ prefix: '/api' }
	);

	return app;
}

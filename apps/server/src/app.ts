import Fastify from 'fastify';
import {
	serializerCompiler,
	validatorCompiler,
} from 'fastify-type-provider-zod';
import { APP_NAME } from '@orbi/shared';
import type { Auth } from './auth';
import { registerErrorHandler } from './error-handler';
import { loggerOptions } from './log';
import { createAuthRoutes } from './modules/auth/routes';
import { createRequireUser } from './modules/auth/session';
import { createCourseRoutes } from './modules/courses/routes';
import type { CourseService } from './modules/courses/service';
import { createNoteRoutes } from './modules/notes/routes';
import type { NoteService } from './modules/notes/service';
import { createProfileRoutes } from './modules/profile/routes';
import type { ProfileService } from './modules/profile/service';
import { createQuestionRoutes } from './modules/questions/routes';
import type { QuestionService } from './modules/questions/service';
import { createTutorRoutes } from './modules/tutor/routes';
import type { TutorService } from './modules/tutor/service';

export type AppDeps = {
	auth: Auth;
	services: {
		courses: CourseService;
		notes: NoteService;
		profiles: ProfileService;
		questions: QuestionService;
		tutor: TutorService;
	};
};

export function buildApp({ auth, services }: AppDeps) {
	const app = Fastify({
		logger: process.env.NODE_ENV !== 'test' && loggerOptions,
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
			api.register(
				createQuestionRoutes({ questions: services.questions, requireUser })
			);
			api.register(createTutorRoutes({ tutor: services.tutor, requireUser }));
		},
		{ prefix: '/api' }
	);

	return app;
}

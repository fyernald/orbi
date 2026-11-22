import Fastify from 'fastify';
import {
	serializerCompiler,
	validatorCompiler,
} from 'fastify-type-provider-zod';
import { APP_NAME } from '@orbi/shared';
import type { Auth } from './auth';
import { registerErrorHandler } from './error-handler';
import type { ReportError } from './error-reporter';
import { loggerOptions } from './log';
import { createAuthRoutes } from './modules/auth/routes';
import { createRequireLogin, createRequireUser } from './modules/auth/session';
import { createBetaRoutes } from './modules/beta/routes';
import type { BetaService } from './modules/beta/service';
import { createCourseRoutes } from './modules/courses/routes';
import { createCspReportRoutes } from './modules/csp-report/routes';
import type { CourseService } from './modules/courses/service';
import { createKeyPointRoutes } from './modules/notes/key-points/routes';
import type { PrepareKeyPoints } from './modules/notes/key-points/writer';
import { createVoiceNoteRoutes } from './modules/notes/voice/routes';
import type { WriteVoiceNote } from './modules/notes/voice/writer';
import { createNoteRoutes } from './modules/notes/routes';
import type { NoteService } from './modules/notes/service';
import { createProfileRoutes } from './modules/profile/routes';
import type { ProfileService } from './modules/profile/service';
import { createQuestionRoutes } from './modules/questions/routes';
import type { QuestionService } from './modules/questions/service';
import { createTutorRoutes } from './modules/tutor/routes';
import type { TutorService } from './modules/tutor/service';
import { createUsageRoutes } from './modules/usage/routes';
import type { UsageService } from './modules/usage/service';
import { RATE_LIMITS, registerRateLimit, type RateLimits } from './rate-limit';

export type AppDeps = {
	auth: Auth;
	services: {
		beta: BetaService;
		courses: CourseService;
		notes: NoteService;
		keyPoints: PrepareKeyPoints;
		voiceNotes: WriteVoiceNote;
		profiles: ProfileService;
		questions: QuestionService;
		tutor: TutorService;
		usage: UsageService;
	};
	limits?: RateLimits;
	// unexpected errors also go here (Sentry in production)
	reportError?: ReportError;
};

// The API is only reached through a proxy on a private network: nginx through the
// Docker network in production, the Next.js server on the same network, and the
// Next.js rewrite on this machine in development. From those addresses Fastify takes
// the student's address and the scheme from X-Forwarded-*; a client that connects
// from anywhere else cannot set them. The names are proxy-addr's ranges.
const TRUSTED_PROXIES = ['loopback', 'uniquelocal'];

export function buildApp({
	auth,
	services,
	limits = RATE_LIMITS,
	reportError,
}: AppDeps) {
	const app = Fastify({
		logger: process.env.NODE_ENV !== 'test' && loggerOptions,
		trustProxy: TRUSTED_PROXIES,
	});

	// route schemas are the shared Zod schemas (app-patterns rule 4)
	app.setValidatorCompiler(validatorCompiler);
	app.setSerializerCompiler(serializerCompiler);
	registerErrorHandler(app, reportError);
	registerRateLimit(app, limits.default);

	const requireLogin = createRequireLogin(auth);
	// every route with the student's data needs beta access too (US-50)
	const requireUser = createRequireUser(
		requireLogin,
		services.beta.requireAccess
	);

	// every route is live under /api, so the reverse proxy can send /api/* to this server
	app.register(
		async (api) => {
			// an uptime check may call it as often as it likes
			api.get('/health', { config: { rateLimit: false } }, async () => ({
				status: 'ok',
				app: APP_NAME,
			}));
			api.register(createAuthRoutes({ auth }));
			api.register(createCspReportRoutes());
			api.register(
				createBetaRoutes({ beta: services.beta, requireLogin, limits })
			);
			api.register(
				createCourseRoutes({ courses: services.courses, requireUser })
			);
			api.register(
				createNoteRoutes({ notes: services.notes, requireUser, limits })
			);
			api.register(
				createKeyPointRoutes({
					prepareKeyPoints: services.keyPoints,
					requireUser,
					limits,
				})
			);
			api.register(
				createVoiceNoteRoutes({
					writeVoiceNote: services.voiceNotes,
					requireUser,
					limits,
				})
			);
			api.register(
				createProfileRoutes({ profiles: services.profiles, requireUser })
			);
			api.register(
				createQuestionRoutes({
					questions: services.questions,
					requireUser,
					limits,
				})
			);
			api.register(
				createTutorRoutes({ tutor: services.tutor, requireUser, limits })
			);
			api.register(createUsageRoutes({ usage: services.usage, requireUser }));
		},
		{ prefix: '/api' }
	);

	return app;
}

import type { TokenBudget } from './ai/budget';
import { createModelRegistry, type ModelRegistry } from './ai/models';
import type { LogUsage } from './ai/usage';
import { buildApp } from './app';
import { createAuth } from './auth';
import { createTestDb } from './db/testing';
import type { Mailer } from './mail/mailer';
import { createMemoryMailer } from './mail/testing';
import { createCourseRepository } from './modules/courses/repository';
import { createCourseService } from './modules/courses/service';
import { createNoteRepository } from './modules/notes/repository';
import { createNoteService } from './modules/notes/service';
import { createPdfReader, type PdfReader } from './pdf/reader';
import type { RateLimits } from './rate-limit';
import { createProfileRepository } from './modules/profile/repository';
import { createProfileService } from './modules/profile/service';
import { createQuestionRepository } from './modules/questions/repository';
import { createQuestionService } from './modules/questions/service';
import type { ReplyLimiter } from './modules/tutor/reply-limiter';
import { createTutorRepository } from './modules/tutor/repository';
import { createTutorService } from './modules/tutor/service';

export const TEST_ORIGIN = 'http://localhost:3000';

const NO_LIMITS: RateLimits = {
	default: 1_000_000,
	pdfUpload: 1_000_000,
	followUps: 1_000_000,
	sessionAnswer: 1_000_000,
};

type TestAppOptions = {
	requireEmailVerification?: boolean;
	// a registry with mock models; by default no AI provider is set up
	models?: ModelRegistry;
	limiter?: ReplyLimiter;
	// by default a student has the production budget of tokens per day
	budget?: TokenBudget;
	// gets the token counts of every model call
	logUsage?: LogUsage;
	// pass one to put rows in place that no route can make, like the tutor's questions
	db?: TestDb;
	// by default the real reader; a slower one lets tests send uploads at the same time
	pdf?: PdfReader;
	// by default high enough that no test reaches them
	limits?: RateLimits;
};

type TestDb = Awaited<ReturnType<typeof createTestDb>>;

// the whole app on an in-memory database, for tests with app.inject();
// pass a memory mailer to read the emails it sends
export async function createTestApp(
	mailer: Mailer = createMemoryMailer(),
	{
		requireEmailVerification = true,
		models = createModelRegistry({ providers: {} }),
		limiter,
		budget,
		logUsage,
		db: givenDb,
		pdf = createPdfReader(),
		limits = NO_LIMITS,
	}: TestAppOptions = {}
) {
	const db = givenDb ?? (await createTestDb());
	const auth = createAuth({
		db,
		secret: 'test-secret-that-is-at-least-32-characters',
		baseURL: TEST_ORIGIN,
		mailer,
		requireEmailVerification,
	});
	const courses = createCourseService({ repo: createCourseRepository(db) });
	const notes = createNoteService({ repo: createNoteRepository(db), pdf });
	const profiles = createProfileService({ repo: createProfileRepository(db) });
	const questions = createQuestionService({
		repo: createQuestionRepository(db),
	});
	const tutor = createTutorService({
		repo: createTutorRepository(db),
		models,
		limiter,
		budget,
		logError: () => {},
		logUsage,
	});
	return buildApp({
		auth,
		services: { courses, notes, profiles, questions, tutor },
		limits,
	});
}

type TestApp = Awaited<ReturnType<typeof createTestApp>>;

// signs up a new user on an app made with requireEmailVerification: false
// and gives the cookie header that logs later requests in as them
export async function signUpTestUser(app: TestApp, email: string) {
	const response = await app.inject({
		method: 'POST',
		url: '/api/auth/sign-up/email',
		headers: { origin: TEST_ORIGIN },
		payload: { name: 'Ada', email, password: 'correct-horse-battery' },
	});
	const cookies = response.cookies.map(({ name, value }) => `${name}=${value}`);
	return cookies.join('; ');
}

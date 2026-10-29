import { buildApp } from './app';
import { createAuth } from './auth';
import { createTestDb } from './db/testing';
import type { Mailer } from './mail/mailer';
import { createMemoryMailer } from './mail/testing';
import { createCourseRepository } from './modules/courses/repository';
import { createCourseService } from './modules/courses/service';

export const TEST_ORIGIN = 'http://localhost:3000';

// the whole app on an in-memory database, for tests with app.inject();
// pass a memory mailer to read the emails it sends
export async function createTestApp(
	mailer: Mailer = createMemoryMailer(),
	{ requireEmailVerification = true } = {}
) {
	const db = await createTestDb();
	const auth = createAuth({
		db,
		secret: 'test-secret-that-is-at-least-32-characters',
		baseURL: TEST_ORIGIN,
		mailer,
		requireEmailVerification,
	});
	const courses = createCourseService({ repo: createCourseRepository(db) });
	return buildApp({ auth, services: { courses } });
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

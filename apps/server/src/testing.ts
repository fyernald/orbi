import { buildApp } from './app';
import { createAuth } from './auth';
import { createTestDb } from './db/testing';
import type { Mailer } from './mail/mailer';
import { createMemoryMailer } from './mail/testing';

export const TEST_ORIGIN = 'http://localhost:3000';

// the whole app on an in-memory database, for tests with app.inject();
// pass a memory mailer to read the emails it sends
export async function createTestApp(mailer: Mailer = createMemoryMailer()) {
	const db = await createTestDb();
	const auth = createAuth({
		db,
		secret: 'test-secret-that-is-at-least-32-characters',
		baseURL: TEST_ORIGIN,
		mailer,
	});
	return buildApp({ auth });
}

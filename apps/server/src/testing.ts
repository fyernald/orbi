import { buildApp } from './app';
import { createAuth } from './auth';
import { createTestDb } from './db/testing';

export const TEST_ORIGIN = 'http://localhost:3000';

// the whole app on an in-memory database, for tests with app.inject()
export async function createTestApp() {
	const db = await createTestDb();
	const auth = createAuth({
		db,
		secret: 'test-secret-that-is-at-least-32-characters',
		baseURL: TEST_ORIGIN,
	});
	return buildApp({ auth });
}

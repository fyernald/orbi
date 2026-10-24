import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from './schema';

// an in-memory Postgres with the real migrations, so tests need no database server
export async function createTestDb() {
	const db = drizzle({ client: new PGlite(), schema });
	await migrate(db, {
		migrationsFolder: fileURLToPath(new URL('../../drizzle', import.meta.url)),
	});
	return db;
}

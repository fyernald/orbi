import { drizzle } from 'drizzle-orm/node-postgres';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from './schema';

// any Postgres driver fits, so tests can pass an in-memory PGlite database
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

// the pool connects on the first query, not here
export function createDb(url: string) {
	return drizzle({ connection: url, schema });
}
